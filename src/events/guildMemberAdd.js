module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            const guildSettings = await client.db.getGuildSettings(member.guild.id, client.cache);

            if (guildSettings.welcomeChannel) {
                const channel =
                    member.guild.channels.cache.get(guildSettings.welcomeChannel) ||
                    await member.guild.channels.fetch(guildSettings.welcomeChannel).catch(() => null);

                if (channel && typeof channel.send === 'function') {
                    const welcomeMessage =
                        guildSettings.welcomeMessage || 'Welcome to the server, {member}!';

                    await channel.send({
                        content: welcomeMessage
                            .replace('{member}', member.toString())
                            .replace('{user}', member.toString())
                            .replace('{guild}', member.guild.name),
                    });
                }
            }

            if (Array.isArray(guildSettings.autoRoles) && guildSettings.autoRoles.length > 0) {
                for (const roleId of guildSettings.autoRoles) {
                    const role =
                        member.guild.roles.cache.get(roleId) ||
                        await member.guild.roles.fetch(roleId).catch(() => null);

                    if (role && member.manageable) {
                        await member.roles.add(role).catch((error) => {
                            client.logger.warn(`Could not assign auto-role ${roleId}:`, error.message);
                        });
                    }
                }
            }
        } catch (error) {
            client.logger.error('Member join error:', error);
        }
    },
};
