const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            // Chat input commands: execute and let command-level permissions control access
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);

                if (!command) {
                    return interaction.reply({ content: '❌ Command not found.', ephemeral: true });
                }

                const rateLimitKey = `cmd_${interaction.user.id}`;
                if (client.rateLimiter.isLimited(rateLimitKey)) {
                    return interaction.reply({ content: '⏰ You are being rate limited. Try again later.', ephemeral: true });
                }

                await command.execute(interaction, client);
                client.rateLimiter.addRequest(rateLimitKey);
                return;
            }

            // Buttons: find handler (handlers should enforce admin checks where needed)
            if (interaction.isButton()) {
                let button = client.buttons.get(interaction.customId);
                if (!button) {
                    for (const [key, value] of client.buttons) {
                        if (key instanceof RegExp && key.test(interaction.customId)) {
                            button = value;
                            break;
                        }
                    }
                }
                if (button) await button.execute(interaction, client);
                return;
            }

            if (
                interaction.isStringSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isUserSelectMenu() ||
                interaction.isChannelSelectMenu() ||
                interaction.isMentionableSelectMenu()
            ) {
                const menu = client.selectMenus.get(interaction.customId);
                if (menu) await menu.execute(interaction, client);
                return;
            }

            if (interaction.isModalSubmit()) {
                const modal = client.modals.get(interaction.customId);
                if (modal) await modal.execute(interaction, client);
                return;
            }

            if (interaction.isContextMenuCommand()) {
                const contextMenu = client.contextMenus.get(interaction.commandName);
                if (contextMenu) await contextMenu.execute(interaction, client);
            }
        } catch (error) {
            client.logger.error('Interaction error:', error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '❌ An error occurred while processing your request.',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: '❌ An error occurred while processing your request.',
                    ephemeral: true,
                });
            }
        }
    },
};
