module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        try {
            const xpGain = Math.floor(Math.random() * 15) + 5;
            await client.db.updateUserXP(message.guild.id, message.author.id, xpGain, client.cache);
        } catch (error) {
            client.logger.error('Message handler error:', error);
        }
    },
};
