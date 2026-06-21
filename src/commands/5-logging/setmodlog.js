/**
 * MODULE 5: LOGGING
 * Command: setmodlog - Set moderation log channel
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmodlog')
        .setDescription('📝 Set the moderation log channel')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel where moderation logs are posted')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.options.getChannel('channel');
            await client.db.updateGuildSettings(interaction.guildId, { modLogChannel: channel.id }, client.cache);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Moderation log set')
                        .setDescription(`Will log moderation actions in ${channel}.`)
                        .setColor(Colors.Green),
                ],
            });
        } catch (error) {
            client.logger.error('SetModLog command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not set mod log channel.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};