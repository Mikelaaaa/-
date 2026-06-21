/**
 * MODULE 3: RPG & LEVELING
 * Command: profile - View user's RPG profile
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('👤 View your or someone\'s RPG profile')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view profile for')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const userData = await client.db.getUser(interaction.guildId, targetUser.id, client.cache);

            // Calculate XP progress
            const xpPerLevel = 1000;
            const currentLevelXP = userData.level * xpPerLevel;
            const nextLevelXP = (userData.level + 1) * xpPerLevel;
            const xpProgress = userData.xp - (userData.level - 1) * xpPerLevel;

            const progressBar = this.createProgressBar(xpProgress, xpPerLevel, 10);

            // Get stats
            const stats = userData.skills;

            const embed = new EmbedBuilder()
                .setTitle(`${targetUser.username}'s RPG Profile`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setColor(Colors.Purple)
                .addFields(
                    {
                        name: '⚔️ Level',
                        value: `${userData.level}`,
                        inline: true
                    },
                    {
                        name: '🎯 Class',
                        value: userData.class || 'Novice',
                        inline: true
                    },
                    {
                        name: '📊 Total XP',
                        value: `${userData.xp.toLocaleString()}`,
                        inline: true
                    },
                    {
                        name: '📈 XP Progress',
                        value: `${progressBar}\n${xpProgress}/${xpPerLevel} XP`,
                        inline: false
                    },
                    {
                        name: '⚔️ Combat',
                        value: `${stats.combat}`,
                        inline: true
                    },
                    {
                        name: '✨ Magic',
                        value: `${stats.magic}`,
                        inline: true
                    },
                    {
                        name: '🔨 Crafting',
                        value: `${stats.crafting}`,
                        inline: true
                    },
                    {
                        name: '⛏️ Mining',
                        value: `${stats.mining}`,
                        inline: true
                    },
                    {
                        name: '🏆 Achievements',
                        value: `${userData.achievements.length}`,
                        inline: true
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Profile command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not fetch profile.')
                        .setColor(Colors.Red)
                ]
            });
        }
    },

    /**
     * Create a progress bar
     */
    createProgressBar(current, max, barLength = 10) {
        const filled = Math.round((current / max) * barLength);
        const empty = barLength - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
};
