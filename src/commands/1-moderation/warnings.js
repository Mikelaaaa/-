/**
 * MODULE 1: MODERATION
 * Command: warnings - View warnings for a user
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('📌 View warning history for a user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view warnings for')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const target = interaction.options.getUser('user') || interaction.user;
            const warnings = await client.db.getUserWarnings(interaction.guildId, target.id);

            if (!warnings || warnings.length === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('✅ No warnings')
                            .setDescription(`${target.tag} has no warnings.`)
                            .setColor(Colors.Green),
                    ],
                });
            }

            const lines = warnings.slice(0, 5).map((warn, index) => {
                return `**${index + 1}.** ${warn.reason} — <@${warn.moderatorId}>`;
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`⚠️ Warnings for ${target.tag}`)
                        .setDescription(lines.join('\n'))
                        .addFields({ name: 'Total warnings', value: `${warnings.length}`, inline: true })
                        .setColor(Colors.Orange),
                ],
            });
        } catch (error) {
            client.logger.error('Warnings command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not load warnings.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};