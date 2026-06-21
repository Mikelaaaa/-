/**
 * MODULE 10: SERVER MANAGEMENT
 * Command: serverinfo - Display comprehensive server statistics
 */

const { SlashCommandBuilder, EmbedBuilder, Colors, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('📊 Display comprehensive server statistics and information')
        .setDMPermission(false),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const guild = interaction.guild;
            const owner = await guild.fetchOwner();

            // Fetch statistics
            const totalMembers = guild.memberCount;
            const humans = await guild.members.fetch().then(m => m.filter(mem => !mem.user.bot).size);
            const bots = totalMembers - humans;
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const idleMembers = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
            const dndMembers = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
            const offlineMembers = guild.members.cache.filter(m => !m.presence).size;

            // Channel counts
            const textChannels = guild.channels.cache.filter(ch => ch.isTextBased()).size;
            const voiceChannels = guild.channels.cache.filter(ch => ch.isVoiceBased()).size;
            const categories = guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).size;

            // Role and emoji info
            const roles = guild.roles.cache.size;
            const emojis = guild.emojis.cache.size;
            const boostLevel = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount;

            // Dates
            const createdAt = Math.floor(guild.createdTimestamp / 1000);
            const joinedAt = Math.floor(guild.joinedAt.getTime() / 1000);

            // Create main embed
            const embed = new EmbedBuilder()
                .setTitle(`📊 ${guild.name} - Server Statistics`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
                .setColor(Colors.Blurple)
                .setTimestamp();

            // Owner & Server Info
            embed.addFields(
                {
                    name: '👑 Owner',
                    value: `${owner.user.tag}\n(ID: ${owner.id})`,
                    inline: true,
                },
                {
                    name: '🔑 Server ID',
                    value: guild.id,
                    inline: true,
                },
                {
                    name: '📍 Region',
                    value: guild.preferredLocale.toUpperCase(),
                    inline: true,
                }
            );

            // Members breakdown
            embed.addFields({
                name: '👥 Members',
                value: `**Total:** ${totalMembers}\n**Humans:** ${humans}\n**Bots:** ${bots}`,
                inline: true,
            });

            // Member Status
            embed.addFields({
                name: '🎮 Member Status',
                value: `🟢 Online: ${onlineMembers}\n🟡 Idle: ${idleMembers}\n🔴 DND: ${dndMembers}\n⚫ Offline: ${offlineMembers}`,
                inline: true,
            });

            // Channels
            embed.addFields({
                name: '📂 Channels',
                value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}`,
                inline: true,
            });

            // Roles & Emojis
            embed.addFields(
                { name: '🏷️ Roles', value: `${roles}`, inline: true },
                { name: '😊 Custom Emojis', value: `${emojis}`, inline: true }
            );

            // Boosters
            embed.addFields({
                name: `⭐ Server Boosts`,
                value: `**Level:** ${boostLevel}\n**Count:** ${boostCount}`,
                inline: true,
            });

            // Dates
            embed.addFields(
                {
                    name: '📅 Created',
                    value: `<t:${createdAt}:F>`,
                    inline: true,
                },
                {
                    name: '🤖 Bot Joined',
                    value: `<t:${joinedAt}:F>`,
                    inline: true,
                }
            );

            // Moderation settings
            const guildSettings = await client.db.getGuildSettings(guild.id, client.cache);
            const features = guildSettings.features || {};
            const enabledFeatures = Object.entries(features)
                .filter(([_, enabled]) => enabled)
                .map(([feature]) => `✅ ${feature}`)
                .join('\n') || 'None enabled';

            embed.addFields({
                name: '⚙️ Enabled Features',
                value: enabledFeatures,
                inline: false,
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Serverinfo command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not fetch server information.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },
};
