/**
 * Command Template - Discord.js v14
 * Copy this structure for creating new commands
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('option1')
                .setDescription('First option')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('option2')
                .setDescription('Second option')
                .setRequired(false)
        ),

    /**
     * Main command execution
     */
    async execute(interaction, client) {
        // Defer reply if command takes time
        await interaction.deferReply({ ephemeral: false });

        try {
            // Get options
            const option1 = interaction.options.getString('option1');
            const option2 = interaction.options.getBoolean('option2');

            // Check permissions
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Permission Denied')
                            .setDescription('You need Administrator permission to use this command.')
                            .setColor(Colors.Red)
                    ]
                });
            }

            // Execute logic
            const embed = new EmbedBuilder()
                .setTitle('✅ Command Executed')
                .setDescription(`Option1: ${option1}\nOption2: ${option2}`)
                .setColor(Colors.Green)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while executing this command.')
                        .setColor(Colors.Red)
                ]
            });
        }
    },

    /**
     * Optional: Handle subcommands
     */
    subcommands: [
        {
            name: 'subcommand1',
            async execute(interaction, client) {
                // Subcommand logic
            }
        }
    ],

    /**
     * Optional: Button interactions
     */
    buttons: [
        {
            customId: 'button_id',
            async execute(interaction, client) {
                // Button logic
            }
        }
    ]
};
