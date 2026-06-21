const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.logger.info(`✅ Bot logged in as ${client.user.tag}`);
        client.logger.info(`📊 Serving ${client.guilds.cache.size} guilds`);
        client.logger.info(`👥 Total users: ${client.users.cache.size}`);

        try {
            client.user.setPresence({
                activities: [{ name: '/help • 150+ Features', type: ActivityType.Watching }],
                status: 'online',
            });
        } catch (error) {
            client.logger.warn('Could not set presence:', error.message);
        }

        try {
            await client.db.connect();
            client.logger.info('🗄️ Database connected successfully');
        } catch (error) {
            client.logger.error('Database connection failed:', error);
        }

        try {
            await client.cache.connect();
            client.logger.info('⚡ Redis cache connected successfully');
        } catch (error) {
            client.logger.warn('Redis cache failed (non-critical):', error.message);
        }
    },
};
