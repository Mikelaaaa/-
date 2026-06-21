/**
 * MODULE 1: MODERATION
 * Command: kick - Remove a user from the server
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🦵 Kick a member from the server')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Member to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for kicking the member')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const member = await interaction.guild.members.fetch(user.id);

            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Permission denied')
                            .setDescription('You cannot kick this member.')
                            .setColor(Colors.Red),
                    ],
                });
            }

            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle('✅ Member Kicked')
                .setDescription(`${user.tag} has been kicked.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setColor(Colors.Orange)
                .setTimestamp();

            const guildSettings = await client.db.getGuildSettings(interaction.guildId, client.cache);
            if (guildSettings.modLogChannel) {
                const modLogChannel = await interaction.guild.channels.fetch(guildSettings.modLogChannel);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            client.logger.error('Kick command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not kick that member.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};