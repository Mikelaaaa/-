/**
 * Deploy Commands Utility
 * Registers all slash commands with Discord
 */

require('dotenv').config();
const path = require('path');
const CommandHandler = require('../handlers/CommandHandler');
const Logger = require('./Logger');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const logger = new Logger();
const commandHandler = new CommandHandler(client);

(async () => {
    try {
        logger.info('🚀 Starting command deployment...');

        const commandsPath = path.join(__dirname, '../commands');
        const isGlobal = process.argv[2] !== '--guild';

        await commandHandler.deployCommands(commandsPath, isGlobal);

        logger.success('✅ Commands deployed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Deployment failed:', error);
        process.exit(1);
    }
})();
