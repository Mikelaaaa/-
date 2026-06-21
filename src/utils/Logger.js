/**
 * Logger Utility
 * Color-coded logging for development and production
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

class Logger {
    constructor() {
        this.timestamp = () => new Date().toLocaleTimeString();
        this.level = (process.env.LOG_LEVEL || 'info').toLowerCase();
        this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    }

    /**
     * Info log
     */
    info(message, data = '') {
        if (this.levels[this.level] <= this.levels.info) {
            console.log(
                `${colors.cyan}[${this.timestamp()}]${colors.reset} ${colors.blue}ℹ ${message}${colors.reset} ${data}`
            );
        }
    }

    /**
     * Success log
     */
    success(message, data = '') {
        if (this.levels[this.level] <= this.levels.info) {
            console.log(
                `${colors.cyan}[${this.timestamp()}]${colors.reset} ${colors.green}✅ ${message}${colors.reset} ${data}`
            );
        }
    }

    /**
     * Warn log
     */
    warn(message, data = '') {
        if (this.levels[this.level] <= this.levels.warn) {
            console.warn(
                `${colors.cyan}[${this.timestamp()}]${colors.reset} ${colors.yellow}⚠️ ${message}${colors.reset} ${data}`
            );
        }
    }

    /**
     * Error log
     */
    error(message, error) {
        if (this.levels[this.level] <= this.levels.error) {
            console.error(
                `${colors.cyan}[${this.timestamp()}]${colors.reset} ${colors.red}❌ ${message}${colors.reset}`,
                error instanceof Error ? error.message : error
            );
        }
    }

    /**
     * Debug log
     */
    debug(message, data = '') {
        if (this.levels[this.level] <= this.levels.debug) {
            console.log(
                `${colors.cyan}[${this.timestamp()}]${colors.reset} ${colors.magenta}🔍 ${message}${colors.reset} ${data}`
            );
        }
    }
}

module.exports = Logger;
