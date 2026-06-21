/**
 * MongoDB Schemas (Mongoose Models)
 * Comprehensive data structures for all bot features
 */

const mongoose = require('mongoose');

// ============ USER SCHEMA ============
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    username: String,
    avatar: String,
    
    // Economy
    balance: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    netWorth: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    lastDaily: Date,
    
    // Leveling & XP
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    class: { type: String, default: 'Novice' }, // RPG class
    skills: {
        combat: { type: Number, default: 1 },
        magic: { type: Number, default: 1 },
        crafting: { type: Number, default: 1 },
        mining: { type: Number, default: 1 },
    },
    
    // Moderation
    warnings: { type: Number, default: 0 },
    isMuted: { type: Boolean, default: false },
    muteExpires: Date,
    infractions: [
        {
            type: { type: String }, // warn, mute, kick, ban
            reason: String,
            moderator: String,
            date: { type: Date, default: Date.now },
        },
    ],
    
    // Profile
    bio: String,
    roles: [String],
    inventory: [
        {
            itemId: String,
            itemName: String,
            quantity: Number,
            rarity: String, // common, rare, epic, legendary
        },
    ],
    achievements: [String],
    
    // Settings
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// ============ GUILD SCHEMA ============
const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    guildName: String,
    guildIcon: String,
    
    // Configuration
    prefix: { type: String, default: '!' },
    language: { type: String, default: 'en' },
    timezone: String,
    
    // Moderation
    modLogChannel: String,
    autoModeration: {
        enabled: { type: Boolean, default: true },
        antiSpam: { type: Boolean, default: true },
        antiPhishing: { type: Boolean, default: true },
        antiRaid: { type: Boolean, default: true },
        maxWarnings: { type: Number, default: 5 },
        spamThreshold: { type: Number, default: 5 },
    },
    
    // Ticketing
    ticketCategory: String,
    ticketCounter: { type: Number, default: 1 },
    supportRoles: [String],
    
    // Leveling
    levelingEnabled: { type: Boolean, default: true },
    xpPerMessage: { type: Number, default: 5 },
    levelUpChannel: String,
    levelUpMessage: String,
    
    // Economy
    economyEnabled: { type: Boolean, default: true },
    currencyName: { type: String, default: 'Credits' },
    currencySymbol: { type: String, default: '💰' },
    
    // Welcome & Leave
    welcomeChannel: String,
    welcomeMessage: String,
    leaveChannel: String,
    leaveMessage: String,
    
    // Auto-roles
    autoRoles: [String],
    reactionRoles: [
        {
            messageId: String,
            emoji: String,
            roleId: String,
        },
    ],
    
    // Features
    features: {
        music: { type: Boolean, default: true },
        economy: { type: Boolean, default: true },
        leveling: { type: Boolean, default: true },
        moderation: { type: Boolean, default: true },
        ticketing: { type: Boolean, default: true },
    },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// ============ WARNING SCHEMA ============
const warningSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: String,
    moderatorId: String,
    createdAt: { type: Date, default: Date.now },
});

// ============ TICKET SCHEMA ============
const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    userId: String,
    guildId: String,
    channelId: String,
    reason: String,
    status: { type: String, enum: ['open', 'claimed', 'closed', 'archived'], default: 'open' },
    claimedBy: String,
    messages: [
        {
            userId: String,
            content: String,
            timestamp: Date,
        },
    ],
    createdAt: { type: Date, default: Date.now },
    closedAt: Date,
    closedBy: String,
});

// ============ TRANSACTION SCHEMA ============
const transactionSchema = new mongoose.Schema({
    fromUserId: String,
    toUserId: String,
    guildId: String,
    amount: Number,
    type: { type: String, enum: ['transfer', 'purchase', 'reward', 'fine', 'casino', 'loan'] },
    description: String,
    createdAt: { type: Date, default: Date.now },
});

// ============ GIVEAWAY SCHEMA ============
const giveawaySchema = new mongoose.Schema({
    giveawayId: { type: String, required: true, unique: true },
    guildId: String,
    channelId: String,
    messageId: String,
    prize: String,
    hostId: String,
    winners: { type: Number, default: 1 },
    participants: [String],
    winnerIds: [String],
    requiredRoleId: String,
    requiredLevel: { type: Number, default: 0 },
    endTime: Date,
    ended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// ============ MODLOG SCHEMA ============
const modlogSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    action: { type: String, enum: ['warn', 'mute', 'kick', 'ban', 'unban', 'timeout'] },
    reason: String,
    moderatorId: String,
    duration: Number, // in milliseconds
    timestamp: { type: Date, default: Date.now },
});

// ============ MESSAGE LOG SCHEMA ============
const messageLogSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    messageId: String,
    channelId: String,
    content: String,
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
    attachments: [String],
    createdAt: { type: Date, default: Date.now },
});

// ============ ECONOMY SHOP SCHEMA ============
const shopSchema = new mongoose.Schema({
    guildId: String,
    itemId: { type: String, required: true },
    itemName: String,
    description: String,
    price: Number,
    stock: Number,
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
    createdAt: { type: Date, default: Date.now },
});

// ============ QUEST SCHEMA ============
const questSchema = new mongoose.Schema({
    guildId: String,
    questId: { type: String, required: true },
    name: String,
    description: String,
    type: { type: String, enum: ['daily', 'weekly', 'monthly', 'achievement'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'epic'] },
    objectives: [
        {
            name: String,
            progress: Number,
            target: Number,
        },
    ],
    rewards: {
        xp: Number,
        currency: Number,
        items: [String],
    },
    createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model('User', userSchema);
const Guild = mongoose.model('Guild', guildSchema);
const Warning = mongoose.model('Warning', warningSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Giveaway = mongoose.model('Giveaway', giveawaySchema);
const ModLog = mongoose.model('ModLog', modlogSchema);
const MessageLog = mongoose.model('MessageLog', messageLogSchema);
const Shop = mongoose.model('Shop', shopSchema);
const Quest = mongoose.model('Quest', questSchema);

module.exports = {
    User,
    Guild,
    Warning,
    Ticket,
    Transaction,
    Giveaway,
    ModLog,
    MessageLog,
    Shop,
    Quest,
};
