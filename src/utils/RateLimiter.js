/**
 * Rate Limiter Utility
 * Prevents command spam and API abuse
 */

class RateLimiter {
    constructor(windowMs = 60000, maxRequests = 5) {
        this.windowMs = windowMs; // Time window in milliseconds
        this.maxRequests = maxRequests; // Max requests per window
        this.requests = new Map();
    }

    /**
     * Check if user is rate limited
     */
    isLimited(key) {
        const now = Date.now();
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        const userRequests = this.requests.get(key);
        
        // Remove requests outside the time window
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        this.requests.set(key, validRequests);

        return validRequests.length >= this.maxRequests;
    }

    /**
     * Add request
     */
    addRequest(key) {
        const now = Date.now();
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        this.requests.get(key).push(now);
    }

    /**
     * Reset user's rate limit
     */
    reset(key) {
        this.requests.delete(key);
    }

    /**
     * Clear all rate limits
     */
    resetAll() {
        this.requests.clear();
    }

    /**
     * Get remaining requests for user
     */
    getRemaining(key) {
        const now = Date.now();
        
        if (!this.requests.has(key)) {
            return this.maxRequests;
        }

        const userRequests = this.requests.get(key);
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        
        return Math.max(0, this.maxRequests - validRequests.length);
    }

    /**
     * Get time until reset (in milliseconds)
     */
    getResetTime(key) {
        if (!this.requests.has(key) || this.requests.get(key).length === 0) {
            return 0;
        }

        const oldestRequest = this.requests.get(key)[0];
        const resetTime = oldestRequest + this.windowMs;
        const now = Date.now();

        return Math.max(0, resetTime - now);
    }
}

module.exports = RateLimiter;
