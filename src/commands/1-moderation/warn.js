/**
 * MODULE 1: MODERATION
 * Command: warn - Issue a warning to a user
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Issue a warning to a user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const member = await interaction.guild.members.fetch(user.id);

            // Check permissions
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Error')
                            .setDescription('You cannot warn this user.')
                            .setColor(Colors.Red)
                    ]
                });
            }

            // Add warning to database
            await client.db.addWarning(interaction.guildId, user.id, reason, interaction.user.id);

            // Get user data
            const userData = await client.db.getUser(interaction.guildId, user.id, client.cache);
            const warningCount = userData.warnings;

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('⚠️ User Warned')
                .setDescription(`${user} has been warned`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Warnings', value: `${warningCount}/5`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setColor(Colors.Orange)
                .setTimestamp();

            // Send DM to user
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('⚠️ You have been warned')
                            .setDescription(`**Guild:** ${interaction.guild.name}\n**Reason:** ${reason}`)
                            .setColor(Colors.Orange)
                    ]
                });
            } catch (e) {
                client.logger.warn('Could not DM user');
            }

            // Auto-action if warnings exceed threshold
            if (warningCount >= 5) {
                await member.timeout(1000 * 60 * 60 * 24); // 24 hour timeout
                embed.addFields({ name: 'Action', value: '⏱️ User timed out for 24 hours', inline: false });
            }

            // Log to mod log
            const guildSettings = await client.db.getGuildSettings(interaction.guildId, client.cache);
            if (guildSettings.modLogChannel) {
                const modLogChannel = await interaction.guild.channels.fetch(guildSettings.modLogChannel);
                if (modLogChannel) {
                    await modLogChannel.send({ embeds: [embed] });
                }
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Warn command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('An error occurred.')
                        .setColor(Colors.Red)
                ]
            });
        }
    }
};
