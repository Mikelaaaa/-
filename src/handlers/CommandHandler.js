/**
 * Advanced Command Handler
 * Supports multi-level subcommands, dynamic loading, and deployment
 */

const fs = require('fs');
const path = require('path');
const { REST } = require('discord.js');
const Logger = require('../utils/Logger');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.logger = new Logger();
        // Only set REST token if provided; avoid setting undefined token
        this.rest = new REST({ version: '10' });
        if (process.env.DISCORD_TOKEN) {
            this.rest.setToken(process.env.DISCORD_TOKEN);
        } else {
            this.logger.warn('DISCORD_TOKEN not set; REST client will not be authenticated.');
        }
    }

    /**
     * Recursively load all commands from directory structure
     */
    async loadCommands(commandsPath) {
        const categories = fs.readdirSync(commandsPath);

        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            const stat = fs.statSync(categoryPath);

            if (!stat.isDirectory()) continue;

            const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

            for (const file of files) {
                const filePath = path.join(categoryPath, file);

                try {
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if (!command || !command.data || !command.data.name) {
                        this.logger.warn(`⚠️ Command ${file} missing required 'data' or name`);
                        continue;
                    }

                    // Ensure there is at least one handler (execute, subcommands, buttons, modals, selectMenus, contextMenus)
                    const hasHandler =
                        typeof command.execute === 'function' ||
                        Array.isArray(command.subcommands) && command.subcommands.length > 0 ||
                        Array.isArray(command.buttons) && command.buttons.length > 0 ||
                        Array.isArray(command.modals) && command.modals.length > 0 ||
                        Array.isArray(command.selectMenus) && command.selectMenus.length > 0 ||
                        Array.isArray(command.contextMenus) && command.contextMenus.length > 0;

                    if (!hasHandler) {
                        this.logger.warn(`⚠️ Command ${file} has no handlers (execute/subcommands/buttons/etc)`);
                        continue;
                    }

                    // Store command by name
                    this.client.commands.set(command.data.name, command);

                    // Handle subcommands
                    if (command.subcommands) {
                        for (const subcommand of command.subcommands) {
                            const subcommandKey = `${command.data.name}_${subcommand.name}`;
                            this.client.subcommands.set(subcommandKey, subcommand);
                        }
                    }

                    // Handle buttons
                    if (command.buttons) {
                        for (const button of command.buttons) {
                            this.client.buttons.set(button.customId, button);
                        }
                    }

                    this.logger.info(`✅ Loaded command: ${command.data.name}`);
                } catch (error) {
                    this.logger.error(`❌ Failed to load command ${file}:`, error);
                }
            }
        }

        this.logger.info(`📂 Loaded ${this.client.commands.size} commands`);
    }

    /**
     * Deploy commands to Discord (global and guild-specific)
     */
    async deployCommands(commandsPath, isGlobal = true) {
        const commands = [];
        const categories = fs.readdirSync(commandsPath);

        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            const stat = fs.statSync(categoryPath);

            if (!stat.isDirectory()) continue;

            const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

            for (const file of files) {
                const filePath = path.join(categoryPath, file);

                try {
                    const command = require(filePath);
                    if (command.data) {
                        commands.push(command.data.toJSON());
                    }
                } catch (error) {
                    this.logger.error(`Error loading command ${file}:`, error);
                }
            }
        }

        try {
            if (isGlobal) {
                await this.rest.put(`/applications/${process.env.APPLICATION_ID}/commands`, {
                    body: commands,
                });
                this.logger.info(`✅ Deployed ${commands.length} commands globally`);
            } else {
                await this.rest.put(
                    `/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`,
                    { body: commands }
                );
                this.logger.info(`✅ Deployed ${commands.length} commands to guild ${process.env.GUILD_ID}`);
            }
        } catch (error) {
            this.logger.error('Failed to deploy commands:', error);
        }
    }

    /**
     * Get command by name
     */
    getCommand(commandName) {
        return this.client.commands.get(commandName);
    }

    /**
     * Get subcommand
     */
    getSubcommand(commandName, subcommandName) {
        const key = `${commandName}_${subcommandName}`;
        return this.client.subcommands.get(key);
    }

    /**
     * Register button handler
     */
    registerButton(customId, handler) {
        this.client.buttons.set(customId, handler);
    }

    /**
     * Register select menu handler
     */
    registerSelectMenu(customId, handler) {
        this.client.selectMenus.set(customId, handler);
    }

    /**
     * Register modal handler
     */
    registerModal(customId, handler) {
        this.client.modals.set(customId, handler);
    }

    /**
     * Register context menu handler
     */
    registerContextMenu(menuName, handler) {
        this.client.contextMenus.set(menuName, handler);
    }
}

module.exports = CommandHandler;
