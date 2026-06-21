const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketconfig')
        .setDescription('Configure ticket system settings for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('Ticket category where new ticket channels will be created')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('support_role')
                .setDescription('Role that can access tickets and manage them')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketCategory = interaction.options.getChannel('category');
            const supportRole = interaction.options.getRole('support_role');

            const settings = {
                ticketCategory: ticketCategory.id,
                supportRoles: supportRole ? [supportRole.id] : [],
            };

            await client.db.updateGuildSettings(interaction.guildId, settings, client.cache);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Ticket Configuration Updated')
                        .setDescription(`Ticket category set to ${ticketCategory} ${supportRole ? `and support role set to ${supportRole}` : ''}`)
                        .setColor(Colors.Green),
                ],
            });
        } catch (error) {
            client.logger.error('Ticket config error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Configuration Failed')
                        .setDescription('Could not update ticket settings.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};
