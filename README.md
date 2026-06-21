# FSOCIETY MEGA BOT 🤖
## Enterprise-Level Discord.js v14 Bot | 150+ Features | 10 Major Modules

An all-in-one Discord bot framework designed to replace 150+ individual bots with a single, highly scalable, enterprise-grade solution.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16.9.0+
- MongoDB 4.0+
- Redis 6.0+
- Discord.js v14

### Installation & Run (local)

1) Install dependencies

```bash
cd FSOCIETY
npm install
```

2) Create environment file (choose platform)

Unix / macOS:
```bash
cp .env.example .env
```

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

3) Edit `.env` and add the required values (at minimum):
- `DISCORD_TOKEN` (bot token)
- `APPLICATION_ID` (from Discord dev portal)
- `GUILD_ID` (optional — use for guild-only deploy)
- `MONGODB_URI` (or leave default local URI)
- `REDIS_URL` (optional)
- `NODE_ENV` (set to `production` for deployment)
- `LOG_LEVEL` (optional: `debug|info|warn|error`, default `info`)

Optional retry settings:
- `DB_CONNECT_RETRIES` (default `3`)
- `REDIS_CONNECT_RETRIES` (default `3`)

4) Deploy slash commands to Discord

Global deploy (may take up to an hour to propagate):
```bash
npm run deploy
```

Guild-only deploy (faster, recommended for testing):
```bash
npm run deploy:guild
```

5) Start the bot

```bash
npm start
```

Notes:
- Keep your `.env` file out of version control — `.gitignore` already excludes it.
- If you don't set `MONGODB_URI` or `REDIS_URL`, the bot will fall back to local defaults but may have reduced features/performance.

---

## 📊 Features Overview

### Module 1: Ultimate Auto-Moderation (15 features)
Comprehensive moderation system with auto-escalation, spam detection, and raid protection.
- Warnings, mutes, kicks, bans with escalation
- Anti-spam, anti-phishing, anti-raid systems
- Ghost ping detection
- Captcha verification
- Invite tracking and restrictions

### Module 2: Global Economy & Trading (15 features)
Multi-server economy system with trading, stocks, and businesses.
- User balances and banking
- Daily/weekly/monthly rewards
- Dynamic stock market
- User-to-user trading with escrow
- Shops and inventory management
- Gambling system with house edge
- Leaderboards and achievements

### Module 3: Deep RPG & Leveling (15 features)
Comprehensive leveling system with classes, skills, and progression.
- XP-based leveling from text/voice activity
- Multiple character classes with bonuses
- Skill trees and stat progression
- Quests and boss fights
- Dungeon exploration
- Crafting and mining systems
- Guilds and collaborative quests

### Module 4: Advanced Ticketing & Support (15 features)
Complete support ticket system with automation.
- Auto-channel creation
- Multi-tier support system
- HTML transcript generation
- Staff rating system
- FAQ and auto-responses
- Priority queue management
- SLA tracking

### Module 5: Logging & Auditing (15 features)
Comprehensive audit logs for compliance and security.
- Message edit/delete logs
- Voice state tracking
- Role and permission changes
- Member join/leave events
- Audit reports and compliance
- User history and stats
- GDPR compliance tools

### Module 6: Utility & API Integrations (15 features)
Real-time data integrations and utilities.
- Cryptocurrency trackers
- Advanced weather radar
- Multi-language translation
- Anime/movie lookups
- GitHub webhook integration
- Twitch stream notifications
- Reddit trending
- Wikipedia searches
- YouTube integration

### Module 7: Music & Audio Engine (15 features)
High-fidelity music streaming with effects.
- YouTube/Spotify playback
- Queue management
- Lyrics fetching
- 24/7 radio mode
- Audio filters (bassboost, nightcore, etc.)
- Playlist creation
- AI-based autoplay recommendations

### Module 8: Giveaways & Events (15 features)
Advanced giveaway and event management.
- Multi-condition giveaways (role/level/age requirements)
- Drop systems
- Trivia hosting
- Event scheduling and reminders
- Tournament brackets
- Stream event integration

### Module 9: Custom Auto-Roles & Verification (15 features)
Automated role management and verification.
- Reaction-based roles
- Dropdown role menus
- Button role assignment
- Auto-role on join
- Temporary roles
- CAPTCHA verification
- Invite tracking with rewards
- Booster exclusive features

### Module 10: Server Management & Stats (15 features)
Comprehensive server administration tools.
- Dynamic voice channels (create-to-call)
- Server stat counters
- Welcome/goodbye image generation
- Timezone management
- Server announcements
- Settings dashboard
- Server backup and restore

---

## 🏗️ Architecture

### Core Components

#### CommandHandler
Sophisticated command loading system with support for:
- Multi-level subcommands
- Category-based folder structure
- Automatic global/guild deployment
- Button, select menu, and modal support
- Dynamic command registration

#### EventHandler
Automated event loading with:
- Error catching per event
- Event reloading capability
- Strict initialization
- Logging and monitoring

#### DatabaseManager
Database abstraction layer supporting:
- MongoDB with Mongoose
- PostgreSQL with Prisma
- Query result caching
- Transaction management
- Schema versioning

#### CacheManager
Redis-based caching for:
- Database query results
- User cooldowns
- Rate limiting
- Temporary data storage
- Automatic TTL management

#### RateLimiter
Request throttling with:
- Sliding window algorithm
- Per-user limits
- Command-specific limits
- Graceful degradation

---

## 📁 Project Structure

```
FSOCIETY/
├── index.js                 # Main entry point
├── package.json
├── .env.example            # Environment template
├── FEATURES_BREAKDOWN.md   # Complete 150+ features list
├── ARCHITECTURE.md         # Technical deep-dive
├── README.md               # This file
│
├── config/
│   └── config.js           # Configuration management
│
└── src/
    ├── commands/
    │   ├── 1-moderation/   # 15 moderation commands
    │   ├── 2-economy/      # 15 economy commands
    │   ├── 3-rpg/          # 15 RPG commands
    │   ├── 4-ticketing/    # 15 ticketing commands
    │   ├── 5-logging/      # 15 logging commands
    │   ├── 6-utility/      # 15 utility commands
    │   ├── 7-music/        # 15 music commands
    │   ├── 8-giveaways/    # 15 giveaway commands
    │   ├── 9-autoroles/    # 15 auto-role commands
    │   └── 10-servermanagement/ # 15 management commands
    │
    ├── events/             # Discord.js event handlers
    │   ├── ready.js
    │   ├── messageCreate.js
    │   ├── guildMemberAdd.js
    │   └── ...
    │
    ├── handlers/
    │   ├── CommandHandler.js    # Dynamic command loading
    │   └── EventHandler.js      # Dynamic event loading
    │
    ├── database/
    │   ├── DatabaseManager.js   # Database abstraction layer
    │   └── models/
    │       └── index.js         # Mongoose schemas
    │
    ├── cache/
    │   └── CacheManager.js      # Redis caching layer
    │
    ├── utils/
    │   ├── Logger.js            # Color-coded logging
    │   ├── RateLimiter.js       # Rate limiting logic
    │   ├── Helpers.js           # Common utility functions
    │   └── deployCommands.js    # Command deployment script
    │
    └── structures/
        └── CommandTemplate.js   # Template for new commands
```

---

## 💾 Database Schema Overview

### User Model
- `userId`, `guildId` (Primary key)
- Economy: `balance`, `bank`, `netWorth`, `dailyStreak`
- Leveling: `xp`, `level`, `class`, `skills`
- Moderation: `warnings`, `isMuted`, `infractions`
- Profile: `bio`, `roles`, `inventory`, `achievements`
- Settings: `notifications`, `language`

### Guild Model
- `guildId` (Unique)
- Configuration: `prefix`, `language`, `timezone`
- Moderation: `modLogChannel`, `autoModeration` settings
- Ticketing: `ticketCategory`, `supportRoles`
- Leveling: `xpPerMessage`, `levelUpChannel`
- Economy: `currencyName`, `currencySymbol`
- Welcome/Leave: `welcomeChannel`, `leaveChannel`
- Features: Enable/disable flags for each module

### Additional Models
- `Warning` - Warning records with reasons
- `Ticket` - Support tickets with transcripts
- `Transaction` - Economy transaction history
- `Giveaway` - Giveaway entries and winners
- `ModLog` - Moderation action audit trail
- `MessageLog` - Deleted/edited messages
- `Shop` - Economy shop items
- `Quest` - RPG quest data

---

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Bot
DISCORD_TOKEN=your_token
APPLICATION_ID=your_app_id
GUILD_ID=your_test_guild_id

# Database
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/fsociety
PRISMA_DATABASE_URL=postgresql://user:pass@localhost/fsociety

# Cache
REDIS_URL=redis://localhost:6379

# APIs
WEATHER_API_KEY=key
CRYPTO_API_KEY=key
GITHUB_TOKEN=token
TWITCH_CLIENT_ID=id
TWITCH_ACCESS_TOKEN=token

# Bot Settings
PREFIX=!
OWNER_ID=your_id
DEFAULT_LANGUAGE=en
NODE_ENV=development
```

---

## 🔧 Creating New Commands

### Basic Command Structure
```javascript
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Description')
        .setDMPermission(false),

    async execute(interaction, client) {
        // Command logic
    }
};
```

### With Subcommands
```javascript
// Add subcommand group
.addSubcommandGroup(group =>
    group
        .setName('group')
        .setDescription('Group description')
        .addSubcommand(sub =>
            sub
                .setName('subcommand')
                .setDescription('Subcommand description')
        )
)
```

### Commands require minimal dependencies—everything is abstracted through the `client` object

---

## 🎯 Scalability & Performance

### Caching Strategy
- Database queries cached for 1 hour (configurable)
- User profiles cached with TTL
- Guild settings cached with invalidation
- Redis connection pooling
- Memory-efficient data structures

### Rate Limiting
- Per-user rate limits (5 requests per 60 seconds)
- Per-command rate limits (configurable)
- Sliding window algorithm
- Graceful degradation with informative messages

### Database Optimization
- Indexed queries on frequently accessed fields
- Connection pooling with Mongoose
- Automatic retry logic
- Query timeout prevention
- Bulk operations for mass updates

### Performance Targets
- ✅ Handle 1000+ simultaneous guild connections
- ✅ Sub-100ms command response time (cached)
- ✅ Support 150+ commands without degradation
- ✅ Process 10k+ events per second
- ✅ Memory usage under 512MB with millions of cached records

---

## 📡 API Integrations

### Supported APIs
- **Cryptocurrency**: CoinGecko, CoinMarketCap
- **Weather**: OpenWeatherMap, Weather API
- **Entertainment**: MyAnimeList, OMDB, TMDB
- **Development**: GitHub, Twitch, Stack Overflow
- **Utilities**: Wikipedia, Reddit, YouTube

### Webhook Support
- GitHub webhooks for commits/releases
- Twitch webhooks for stream notifications
- Custom webhook receiver (optional Express server)

---

## 🧪 Testing

### Local Development
```bash
# Start with guild-only commands (faster deployment)
npm run deploy-commands -- --guild

# Start the bot
npm start

# Watch mode with auto-restart
npm run dev
```

### Testing Commands
```javascript
// Use Discord's test server
// Commands deploy within 1 second to test guild
// Global deployment takes up to 1 hour
```

---

## 📈 Monitoring & Logging

### Logger Features
- Color-coded output
- Timestamp tracking
- Error stack traces
- Debug mode (development only)
- Log levels: info, success, warn, error, debug

### Bot Statistics
- Command usage tracking
- Error tracking and reporting
- Latency monitoring
- Memory usage tracking
- Uptime statistics

---

## 🔒 Security Features

- Rate limiting prevents abuse
- Input validation and sanitization
- Permission checking on all commands
- Database query injection protection (Mongoose)
- Token rotation support
- Audit logging for all actions
- GDPR compliance helpers
- Data encryption for sensitive fields

---

## 📞 Support & Contributing

### Common Issues

**Commands not showing:**
- Ensure bot has `/applications.commands` permission
- Redeploy with `npm run deploy-commands`
- Wait up to 1 hour for global deployment

**Database connection failed:**
- Verify MongoDB is running
- Check connection string in .env
- Ensure proper authentication

**Redis cache not working:**
- Verify Redis is running
- Check REDIS_URL in .env
- Bot will function without cache (slower)

---

## 📄 License
MIT License - See LICENSE file

---

## 🎓 Educational Value

This bot serves as a complete reference for:
- Discord.js v14 architecture patterns
- Database schema design for Discord bots
- Modular command structure
- Event-driven architecture
- Caching strategies
- Rate limiting implementations
- API integration patterns
- Enterprise-scale bot development

Perfect for:
- Learning Discord.js best practices
- Understanding bot scaling
- Building production bots
- Contributing to open-source Discord projects

---

## 📊 Statistics

- **150+ Commands** across 10 modules
- **10+ Database models** for complex data
- **Redis caching** layer for performance
- **Multi-tier support** system
- **API integrations** with 10+ external services
- **Enterprise-grade** error handling
- **Modular architecture** for easy expansion

---

**Built with ❤️ for the Discord Development Community**

*Last Updated: May 18, 2026*
*Version: 1.0.0*
