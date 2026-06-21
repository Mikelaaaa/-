/**
 * Redis Cache Manager
 * Handles caching for database queries, cooldowns, and temporary data
 */

const redis = require('redis');
const Logger = require('../utils/Logger');

class CacheManager {
    constructor() {
        this.logger = new Logger();
        this.client = null;
    }

    /**
     * Connect to Redis
     */
    async connect() {
        const maxRetries = parseInt(process.env.REDIS_CONNECT_RETRIES || '3', 10);
        const baseDelay = 500; // ms

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.client = redis.createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                    socket: {
                        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
                    },
                });

                if (!process.env.REDIS_URL) {
                    this.logger.warn('REDIS_URL not set; using local default redis://localhost:6379');
                } else {
                    this.logger.info('Using Redis URL from environment (not printed for security)');
                }

                this.client.on('error', (err) => this.logger.error('Redis error:', err));
                this.client.on('connect', () => this.logger.info('Redis connected'));

                await this.client.connect();
                // Connected successfully
                break;
            } catch (error) {
                this.logger.warn(`Redis connection attempt ${attempt} failed: ${error.message}`);
                if (attempt === maxRetries) {
                    this.logger.warn('Redis connection failed: max retries reached; continuing without cache');
                    // Leave client as null to indicate cache not available
                    this.client = null;
                    break;
                }
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }

    /**
     * Get value from cache
     */
    async get(key) {
        try {
            if (!this.client) return null;
            return await this.client.get(key);
        } catch (error) {
            this.logger.warn(`Cache GET error for ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key, value, ttl = 3600) {
        try {
            if (!this.client) return;
            await this.client.setEx(key, ttl, value);
        } catch (error) {
            this.logger.warn(`Cache SET error for ${key}:`, error.message);
        }
    }

    /**
     * Delete value from cache
     */
    async del(key) {
        try {
            if (!this.client) return;
            await this.client.del(key);
        } catch (error) {
            this.logger.warn(`Cache DEL error for ${key}:`, error.message);
        }
    }

    /**
     * Clear all cache
     */
    async flush() {
        try {
            if (!this.client) return;
            await this.client.flushAll();
            this.logger.info('Cache flushed');
        } catch (error) {
            this.logger.warn('Cache FLUSH error:', error.message);
        }
    }

    /**
     * Increment counter
     */
    async increment(key, ttl = 3600) {
        try {
            if (!this.client) return 0;
            const value = await this.client.incr(key);
            if (value === 1) {
                await this.client.expire(key, ttl);
            }
            return value;
        } catch (error) {
            this.logger.warn(`Cache INCR error for ${key}:`, error.message);
            return 0;
        }
    }

    /**
     * Set user cooldown
     */
    async setUserCooldown(userId, commandName, duration) {
        const key = `cooldown_${userId}_${commandName}`;
        await this.set(key, '1', duration);
    }

    /**
     * Check if user is on cooldown
     */
    async checkUserCooldown(userId, commandName) {
        const key = `cooldown_${userId}_${commandName}`;
        const value = await this.get(key);
        return value !== null;
    }

    /**
     * Cache user data
     */
    async cacheUser(guildId, userId, userData, ttl = 3600) {
        const key = `user_${guildId}_${userId}`;
        await this.set(key, JSON.stringify(userData), ttl);
    }

    /**
     * Get cached user data
     */
    async getCachedUser(guildId, userId) {
        const key = `user_${guildId}_${userId}`;
        const data = await this.get(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Cache guild settings
     */
    async cacheGuild(guildId, guildData, ttl = 3600) {
        const key = `guild_${guildId}`;
        await this.set(key, JSON.stringify(guildData), ttl);
    }

    /**
     * Get cached guild settings
     */
    async getCachedGuild(guildId) {
        const key = `guild_${guildId}`;
        const data = await this.get(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Disconnect from Redis
     */
    async disconnect() {
        try {
            if (this.client) {
                await this.client.quit();
                this.logger.info('✅ Redis disconnected');
            }
        } catch (error) {
            this.logger.error('Redis disconnect error:', error);
        }
    }
}

module.exports = CacheManager;
