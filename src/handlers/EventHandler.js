/**
 * Advanced Event Handler
 * Dynamically loads events with error catching and logging
 */

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/Logger');

class EventHandler {
    constructor(client) {
        this.client = client;
        this.logger = new Logger();
        this.loadedEvents = new Map();
    }

    /**
     * Load all events from directory
     */
    async loadEvents(eventsPath) {
        const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);

            try {
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);

                if (!event.name || !event.execute) {
                    this.logger.warn(`⚠️ Event ${file} missing required properties`);
                    continue;
                }

                if (event.once) {
                    this.client.once(event.name, (...args) => this._executeWithErrorHandling(event, args, file));
                } else {
                    this.client.on(event.name, (...args) => this._executeWithErrorHandling(event, args, file));
                }

                this.loadedEvents.set(event.name, { file, execute: event.execute, once: event.once });
                this.logger.info(`✅ Loaded event: ${event.name}`);
            } catch (error) {
                this.logger.error(`❌ Failed to load event ${file}:`, error);
            }
        }

        this.logger.info(`📂 Loaded ${this.loadedEvents.size} events`);
    }

    /**
     * Execute event with error handling
     */
    async _executeWithErrorHandling(event, args, fileName) {
        try {
            await event.execute(...args, this.client);
        } catch (error) {
            this.logger.error(`❌ Error in event ${fileName} (${event.name}):`, error);
        }
    }

    /**
     * Get loaded event
     */
    getEvent(eventName) {
        return this.loadedEvents.get(eventName);
    }

    /**
     * Unload event
     */
    unloadEvent(eventName) {
        this.client.off(eventName);
        this.loadedEvents.delete(eventName);
        this.logger.info(`⬇️ Unloaded event: ${eventName}`);
    }

    /**
     * Reload event
     */
    async reloadEvent(eventName, eventsPath) {
        this.unloadEvent(eventName);
        const eventFile = fs.readdirSync(eventsPath)
            .find(f => f.endsWith('.js') && f.includes(eventName.toLowerCase()));

        if (!eventFile) {
            this.logger.error(`❌ Event file not found for ${eventName}`);
            return;
        }

        const filePath = path.join(eventsPath, eventFile);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);

        if (event.once) {
            this.client.once(event.name, (...args) => this._executeWithErrorHandling(event, args, eventFile));
        } else {
            this.client.on(event.name, (...args) => this._executeWithErrorHandling(event, args, eventFile));
        }

        this.loadedEvents.set(event.name, { file: eventFile, execute: event.execute, once: event.once });
        this.logger.info(`🔄 Reloaded event: ${eventName}`);
    }
}

module.exports = EventHandler;
