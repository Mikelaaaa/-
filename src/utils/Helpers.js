/**
 * Helper Utilities
 * Common functions used across modules
 */

const { EmbedBuilder, Colors } = require('discord.js');

class EmbedHelper {
    /**
     * Create success embed
     */
    static success(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(Colors.Green)
            .setTimestamp();

        fields.forEach(field => {
            embed.addFields(field);
        });

        return embed;
    }

    /**
     * Create error embed
     */
    static error(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(Colors.Red)
            .setTimestamp();

        fields.forEach(field => {
            embed.addFields(field);
        });

        return embed;
    }

    /**
     * Create info embed
     */
    static info(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(Colors.Blue)
            .setTimestamp();

        fields.forEach(field => {
            embed.addFields(field);
        });

        return embed;
    }

    /**
     * Create warning embed
     */
    static warning(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(Colors.Yellow)
            .setTimestamp();

        fields.forEach(field => {
            embed.addFields(field);
        });

        return embed;
    }

    /**
     * Create leaderboard embed
     */
    static leaderboard(title, entries, fields = []) {
        const description = entries
            .map((entry, index) => `**${index + 1}.** ${entry.name} - ${entry.value}`)
            .join('\n');

        return this.info(title, description, fields);
    }
}

class ValidationHelper {
    /**
     * Validate email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     */
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Sanitize string
     */
    static sanitize(str) {
        return str.replace(/[<>]/g, '');
    }

    /**
     * Validate length
     */
    static isValidLength(str, min, max) {
        return str.length >= min && str.length <= max;
    }
}

class TimeHelper {
    /**
     * Format milliseconds to readable time
     */
    static formatTime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    /**
     * Parse duration string (e.g., "2h30m")
     */
    static parseDuration(durationStr) {
        const regex = /(\d+)([smhd])/g;
        let milliseconds = 0;
        let match;

        while ((match = regex.exec(durationStr))) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's':
                    milliseconds += value * 1000;
                    break;
                case 'm':
                    milliseconds += value * 60 * 1000;
                    break;
                case 'h':
                    milliseconds += value * 60 * 60 * 1000;
                    break;
                case 'd':
                    milliseconds += value * 24 * 60 * 60 * 1000;
                    break;
            }
        }

        return milliseconds;
    }

    /**
     * Get current timestamp
     */
    static getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }
}

class StringHelper {
    /**
     * Capitalize first letter
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Truncate string
     */
    static truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.slice(0, length - suffix.length) + suffix;
    }

    /**
     * Generate random string
     */
    static generateRandom(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

module.exports = {
    EmbedHelper,
    ValidationHelper,
    TimeHelper,
    StringHelper,
};
