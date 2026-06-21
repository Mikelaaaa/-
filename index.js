/**
 * FSOCIETY MEGA BOT - Enterprise-Level Discord.js v14 Bot
 * Main Entry Point
 * 150+ features across 10 major modules
 */

require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');

// Render requires a port binding for web services
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('FSOCIETY bot is running');
}).listen(port, () => {
    console.log(`Health listener running on port ${port}`);
});

// Import handlers and utilities
const CommandHandler = require('./src/handlers/CommandHandler');
const EventHandler = require('./src/handlers/EventHandler');
const DatabaseManager = require('./src/database/DatabaseManager');
const CacheManager = require('./src/cache/CacheManager');
const Logger = require('./src/utils/Logger');
const RateLimiter = require('./src/utils/RateLimiter');

// Initialize Discord Client with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
});

/**
 * Attach collections to client for managing data
 */
client.commands = new Collection();
client.subcommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.contextMenus = new Collection();
client.cooldowns = new Collection();

/**
 * Attach managers to client
 */
client.logger = new Logger();
client.db = new DatabaseManager();
client.cache = new CacheManager();
client.rateLimiter = new RateLimiter();

/**
 * Initialize Handlers
 */
const commandHandler = new CommandHandler(client);
const eventHandler = new EventHandler(client);

(async () => {
    try {
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const eventsPath = path.join(__dirname, 'src', 'events');

        await commandHandler.loadCommands(commandsPath);
        await eventHandler.loadEvents(eventsPath);

        if (!process.env.DISCORD_TOKEN) {
            client.logger.error('Missing DISCORD_TOKEN environment variable.');
            await gracefulShutdown(1, 'Missing DISCORD_TOKEN');
            return;
        }

        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        client.logger.error('Startup failed:', error);
        await gracefulShutdown(1, 'Startup failed');
    }
})();

/**
 * Handle member leave
 */
client.on('guildMemberRemove', async (member) => {
    try {
        // Leave logging
        // Cleanup
    } catch (error) {
        client.logger.error('Member leave error:', error);
    }
});

/**
 * Handle voice state changes
 */
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        // Track voice activity for XP
        // Dynamic voice channel creation
        // Music player management
    } catch (error) {
        client.logger.error('Voice state error:', error);
    }
});

/**
 * Handle errors
 */
client.on('error', (error) => {
    client.logger.error('Client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    client.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    client.logger.error('Uncaught Exception:', error);
});

/**
 * Graceful shutdown: attempt to disconnect DB/Cache and destroy client
 */
async function gracefulShutdown(code = 0, reason = '') {
    try {
        client.logger.warn(`Shutting down: ${reason || 'signal received'}`);
    } catch (e) {
        // logger may not exist yet
        console.warn('Shutting down:', reason);
    }

    try {
        if (client.db && typeof client.db.disconnect === 'function') {
            await client.db.disconnect();
        }
    } catch (e) {
        client.logger.error('Error during DB disconnect:', e);
    }

    try {
        if (client.cache && typeof client.cache.disconnect === 'function') {
            await client.cache.disconnect();
        }
    } catch (e) {
        client.logger.error('Error during Cache disconnect:', e);
    }

    try {
        if (client && typeof client.destroy === 'function') {
            await client.destroy();
            client.logger.info('Discord client destroyed');
        }
    } catch (e) {
        console.error('Error destroying client:', e);
    }

    // Force exit after short delay if graceful shutdown hangs
    setTimeout(() => process.exit(code), 5000).unref();
}

process.on('SIGINT', () => gracefulShutdown(0, 'SIGINT'));
process.on('SIGTERM', () => gracefulShutdown(0, 'SIGTERM'));

module.exports = client;
