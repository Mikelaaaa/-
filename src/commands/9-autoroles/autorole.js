/**
 * MODULE 9: AUTOROLES
 * Command: autorole - Set role auto-assigned to new members
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('🤖 Set a role to assign automatically to new members')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Role to assign to new members')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const role = interaction.options.getRole('role');
            await client.db.updateGuildSettings(interaction.guildId, { autoRoles: [role.id] }, client.cache);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Autorole set')
                        .setDescription(`New members will now receive the ${role.name} role automatically.`)
                        .setColor(Colors.Green),
                ],
            });
        } catch (error) {
            client.logger.error('Autorole command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not set autorole.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};