/**
 * MODULE 2: ECONOMY
 * Command: balance - Check user's balance
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('💰 Check your or someone\'s balance')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check balance for')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            
            // Get user data
            const userData = await client.db.getUser(interaction.guildId, targetUser.id, client.cache);
            const guildSettings = await client.db.getGuildSettings(interaction.guildId, client.cache);

            const currencySymbol = guildSettings.currencySymbol || '💰';
            const currencyName = guildSettings.currencyName || 'Credits';

            // Calculate net worth
            const netWorth = userData.balance + userData.bank;

            const embed = new EmbedBuilder()
                .setTitle(`${currencySymbol} ${targetUser.username}'s Wallet`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '💵 Pocket Balance',
                        value: `${userData.balance.toLocaleString()} ${currencySymbol}`,
                        inline: true
                    },
                    {
                        name: '🏦 Bank Balance',
                        value: `${userData.bank.toLocaleString()} ${currencySymbol}`,
                        inline: true
                    },
                    {
                        name: '📊 Net Worth',
                        value: `${netWorth.toLocaleString()} ${currencySymbol}`,
                        inline: true
                    },
                    {
                        name: '📈 Daily Streak',
                        value: `${userData.dailyStreak} days`,
                        inline: true
                    }
                )
                .setColor(Colors.Green)
                .setFooter({ text: `${currencyName} System` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Balance command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not fetch balance.')
                        .setColor(Colors.Red)
                ]
            });
        }
    }
};
