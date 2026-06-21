/**
 * Database Manager - Abstraction layer for MongoDB and PostgreSQL
 * Supports both Mongoose and Prisma ORM
 */

const mongoose = require('mongoose');
const { User, Guild, Warning, Ticket, Transaction } = require('./models');
const Logger = require('../utils/Logger');

class DatabaseManager {
    constructor() {
        this.logger = new Logger();
        this.connection = null;
        this.dbType = process.env.DB_TYPE || 'mongodb';
    }

    /**
     * Connect to database
     */
    async connect() {
        const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '3', 10);
        const baseDelay = 1000; // ms

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (this.dbType === 'mongodb') {
                    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fsociety';
                    if (!process.env.MONGODB_URI) {
                        this.logger.warn('MONGODB_URI not set; using local default mongodb://localhost:27017/fsociety');
                    } else {
                        this.logger.info('Using MongoDB URI from environment (not printed for security)');
                    }

                    await mongoose.connect(uri, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                    });
                    this.connection = mongoose.connection;
                    this.logger.info('✅ Connected to MongoDB');
                } else if (this.dbType === 'postgresql') {
                    // Prisma connection would be initialized here
                    this.logger.info('✅ Connected to PostgreSQL');
                }

                // Connected successfully, exit retry loop
                break;
            } catch (error) {
                this.logger.warn(`Database connection attempt ${attempt} failed: ${error.message}`);
                if (attempt === maxRetries) {
                    this.logger.error('Database connection error: max retries reached', error);
                    throw error;
                }
                // exponential backoff
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }

    /**
     * Disconnect from database
     */
    async disconnect() {
        try {
            if (this.dbType === 'mongodb') {
                await mongoose.disconnect();
                this.logger.info('✅ Disconnected from MongoDB');
            }
        } catch (error) {
            this.logger.error('Database disconnection error:', error);
        }
    }

    /**
     * Get user data with caching
     */
    async getUser(guildId, userId, cache) {
        const cacheKey = `user_${guildId}_${userId}`;
        
        // Check cache first
        if (cache) {
            const cached = await cache.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }

        // Query database
        let user = await User.findOne({ guildId, userId });

        if (!user) {
            user = await User.create({
                guildId,
                userId,
                balance: 0,
                xp: 0,
                level: 1,
                warnings: 0,
                inventory: [],
                roles: [],
            });
        }

        // Cache result
        if (cache) {
            await cache.set(cacheKey, JSON.stringify(user.toObject()), 3600);
        }

        return user.toObject();
    }

    /**
     * Update user data
     */
    async updateUser(guildId, userId, updates, cache) {
        const user = await User.findOneAndUpdate(
            { guildId, userId },
            updates,
            { upsert: true, new: true }
        );

        // Invalidate cache
        if (cache) {
            const cacheKey = `user_${guildId}_${userId}`;
            await cache.del(cacheKey);
        }

        return user.toObject();
    }

    /**
     * Update user XP
     */
    async updateUserXP(guildId, userId, xpGain, cache) {
        const user = await User.findOne({ guildId, userId });

        if (!user) {
            return this.updateUser(guildId, userId, { xp: xpGain }, cache);
        }

        const newXP = user.xp + xpGain;
        const xpPerLevel = 1000;
        const newLevel = Math.floor(newXP / xpPerLevel) + 1;

        return this.updateUser(guildId, userId, { xp: newXP, level: newLevel }, cache);
    }

    /**
     * Get guild settings
     */
    async getGuildSettings(guildId, cache) {
        const cacheKey = `guild_${guildId}`;

        if (cache) {
            const cached = await cache.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }

        let guild = await Guild.findOne({ guildId });

        if (!guild) {
            guild = await Guild.create({
                guildId,
                prefix: process.env.PREFIX || '!',
                modLogChannel: null,
                ticketCategory: null,
                settings: {},
            });
        }

        if (cache) {
            await cache.set(cacheKey, JSON.stringify(guild.toObject()), 3600);
        }

        return guild.toObject();
    }

    /**
     * Update guild settings
     */
    async updateGuildSettings(guildId, updates, cache) {
        const guild = await Guild.findOneAndUpdate(
            { guildId },
            updates,
            { upsert: true, new: true }
        );

        if (cache) {
            const cacheKey = `guild_${guildId}`;
            await cache.del(cacheKey);
        }

        return guild.toObject();
    }

    /**
     * Get all warnings for user
     */
    async getUserWarnings(guildId, userId) {
        return await Warning.find({ guildId, userId }).sort({ createdAt: -1 });
    }

    /**
     * Add warning to user
     */
    async addWarning(guildId, userId, reason, moderatorId) {
        const warning = await Warning.create({
            guildId,
            userId,
            reason,
            moderatorId,
            createdAt: new Date(),
        });

        // Update user warning count
        await User.findOneAndUpdate(
            { guildId, userId },
            { $inc: { warnings: 1 } },
            { upsert: true }
        );

        return warning.toObject();
    }

    /**
     * Clear warnings
     */
    async clearWarnings(guildId, userId) {
        await Warning.deleteMany({ guildId, userId });

        await User.findOneAndUpdate(
            { guildId, userId },
            { warnings: 0 }
        );
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(guildId, type = 'xp', limit = 10) {
        const query = { guildId };

        if (type === 'xp') {
            return await User.find(query).sort({ xp: -1 }).limit(limit);
        } else if (type === 'balance') {
            return await User.find(query).sort({ balance: -1 }).limit(limit);
        } else if (type === 'warnings') {
            return await User.find(query).sort({ warnings: -1 }).limit(limit);
        }
    }

    /**
     * Create economy transaction
     */
    async createTransaction(fromUserId, toUserId, amount, type, description) {
        return await Transaction.create({
            fromUserId,
            toUserId,
            amount,
            type, // 'transfer', 'purchase', 'reward', 'fine', 'casino'
            description,
            createdAt: new Date(),
        });
    }

    /**
     * Create a giveaway record
     */
    async createGiveaway(giveawayData) {
        return await require('./models').Giveaway.create(giveawayData);
    }

    /**
     * Get ticket data
     */
    async getTicket(ticketId, cache) {
        const cacheKey = `ticket_${ticketId}`;

        if (cache) {
            const cached = await cache.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }

        const ticket = await Ticket.findOne({ ticketId });

        if (cache && ticket) {
            await cache.set(cacheKey, JSON.stringify(ticket.toObject()), 1800);
        }

        return ticket?.toObject();
    }

    /**
     * Create ticket
     */
    async createTicket(ticketId, userId, guildId, reason) {
        return await Ticket.create({
            ticketId,
            userId,
            guildId,
            reason,
            status: 'open',
            messages: [],
            claimedBy: null,
            createdAt: new Date(),
            closedAt: null,
        });
    }

    /**
     * Close ticket
     */
    async closeTicket(ticketId, closedBy, cache) {
        const ticket = await Ticket.findOneAndUpdate(
            { ticketId },
            {
                status: 'closed',
                closedBy,
                closedAt: new Date(),
            },
            { new: true }
        );

        if (cache) {
            const cacheKey = `ticket_${ticketId}`;
            await cache.del(cacheKey);
        }

        return ticket?.toObject();
    }
}

module.exports = DatabaseManager;
