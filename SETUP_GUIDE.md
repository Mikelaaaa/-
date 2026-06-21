# FSOCIETY MEGA BOT - SETUP & DEPLOYMENT GUIDE

## Prerequisites

- **Node.js**: 16.9.0 or higher
- **npm**: 8.0.0 or higher
- **MongoDB**: 4.0+ or PostgreSQL 12+
- **Redis**: 6.0+ (optional but recommended)
- **Discord Server**: For testing
- **Discord Application**: Bot created in Developer Portal

---

## Step 1: Create Discord Bot

### 1.1 Visit Discord Developer Portal
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Click "New Application"
- Name your bot (e.g., "FSOCIETY")

### 1.2 Create Bot User
- Go to "Bot" section
- Click "Add Bot"
- Copy the token (save it securely)
- Enable required intents under "Privileged Gateway Intents":
  - ✅ Message Content Intent
  - ✅ Server Members Intent
  - ✅ Guild Presences Intent

### 1.3 Configure OAuth2
- Go to "OAuth2" > "URL Generator"
- Select scopes: `bot`, `applications.commands`
- Select permissions:
  - ✅ Administrator (easier for initial setup)
  - Or select specific permissions for security
- Copy generated URL and invite bot to your server

---

## Step 2: Setup Local Environment

### 2.1 Clone/Setup Project
```bash
# Navigate to FSOCIETY folder
cd FSOCIETY

# Install dependencies
npm install
```

### 2.2 Create Environment File
```bash
# Copy example to actual .env
cp .env.example .env

# Edit with your values
nano .env
# or
code .env
```

### 2.3 Configure .env

```env
# Required - Copy from Discord Developer Portal
DISCORD_TOKEN=your_actual_bot_token_here
APPLICATION_ID=your_app_id_here

# For guild-only command deployment (faster for testing)
GUILD_ID=your_test_server_id_here

# Database Configuration
DB_TYPE=mongodb

# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/fsociety

# Option 2: MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fsociety?retryWrites=true&w=majority

# PostgreSQL (if using instead of MongoDB)
PRISMA_DATABASE_URL=postgresql://user:password@localhost:5432/fsociety

# Redis Cache
REDIS_URL=redis://localhost:6379

# API Keys (Optional - add as needed)
WEATHER_API_KEY=your_openweather_key
CRYPTO_API_KEY=your_crypto_key
GITHUB_TOKEN=your_github_token

# Bot Configuration
PREFIX=!
OWNER_ID=your_discord_user_id
DEFAULT_LANGUAGE=en

# Environment
NODE_ENV=development
```

---

## Step 3: Setup Database

### Option A: Local MongoDB (Development)

#### Windows
```bash
# Download MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Install and start MongoDB service
# MongoDB will run on localhost:27017
```

#### macOS
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Create database user with strong password
5. Get connection string
6. Add your IP to whitelist
7. Update `MONGODB_URI` in .env

---

## Step 4: Setup Redis (Optional but Recommended)

### Windows
```bash
# Download Redis from https://github.com/microsoftarchive/redis/releases
# Or use Windows Subsystem for Linux (WSL)
```

### macOS
```bash
brew install redis
brew services start redis
```

### Linux
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Docker (Any OS)
```bash
docker run -d -p 6379:6379 redis:latest
```

---

## Step 5: Deploy Commands

### Option A: Deploy to Test Guild (Fast)
```bash
# Fast deployment (1 second) - Good for development
npm run deploy-commands -- --guild

# Or manually:
node src/utils/deployCommands.js --guild
```

### Option B: Deploy Globally (Slow)
```bash
# Global deployment (up to 1 hour) - For production
npm run deploy-commands

# Or manually:
node src/utils/deployCommands.js
```

---

## Step 6: Start the Bot

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Expected Output
```
[HH:MM:SS] ℹ ✅ Bot logged in as BotName#1234
[HH:MM:SS] 📊 Serving 1 guilds
[HH:MM:SS] 👥 Total users: 50
[HH:MM:SS] 🗄️ Database connected successfully
[HH:MM:SS] ⚡ Redis cache connected successfully
[HH:MM:SS] 📂 Commands loaded successfully
[HH:MM:SS] 🎯 Events loaded successfully
```

---

## Step 7: Test Commands

1. Go to your test Discord server
2. Type `/` to see slash commands
3. Try a simple command like `/balance` or `/profile`
4. Check bot response in Discord

---

## Troubleshooting

### Bot Not Showing in Server
**Solution**: Invite link doesn't have `applications.commands` scope
- Regenerate OAuth2 URL with correct scopes
- Re-invite bot to server

### Commands Not Appearing
**Solution**: Commands not deployed yet
```bash
# Re-deploy commands
npm run deploy-commands -- --guild

# If still not working:
# 1. Restart bot
# 2. Wait 15 seconds
# 3. Refresh Discord (Ctrl+R)
```

### Database Connection Error
**Solution**: MongoDB not running or wrong URI
```bash
# Check MongoDB is running
# Windows: Services > MongoDB
# macOS: brew services list
# Linux: sudo systemctl status mongodb

# Verify connection string in .env
# Test connection:
mongosh "mongodb://localhost:27017"
```

### Redis Connection Failed
**Solution**: Bot will work without Redis (slower)
- Commands will still execute
- Install Redis for caching: `brew install redis` (macOS)
- Or ignore - it's optional

### "Token Invalid" Error
**Solution**: Wrong token in .env
- Go to Discord Developer Portal
- Click "Bot" > "Reset Token"
- Copy new token to .env
- Restart bot

---

## Project Structure After Setup

```
FSOCIETY/
├── index.js
├── package.json
├── .env ← Your configuration (NEVER commit this!)
├── README.md
├── FEATURES_BREAKDOWN.md
├── ARCHITECTURE.md
├── SETUP_GUIDE.md ← This file
│
├── src/
│   ├── commands/
│   │   ├── 1-moderation/
│   │   │   └── warn.js
│   │   ├── 2-economy/
│   │   │   └── balance.js
│   │   ├── 3-rpg/
│   │   │   └── profile.js
│   │   ├── 4-ticketing/
│   │   │   └── ticket.js
│   │   ├── 8-giveaways/
│   │   │   └── giveaway.js
│   │   └── 10-servermanagement/
│   │       └── serverinfo.js
│   │
│   ├── events/
│   │   └── (event files here)
│   │
│   ├── database/
│   │   ├── DatabaseManager.js
│   │   └── models/
│   │       └── index.js
│   │
│   ├── cache/
│   │   └── CacheManager.js
│   │
│   ├── handlers/
│   │   ├── CommandHandler.js
│   │   └── EventHandler.js
│   │
│   ├── utils/
│   │   ├── Logger.js
│   │   ├── RateLimiter.js
│   │   ├── Helpers.js
│   │   └── deployCommands.js
│   │
│   └── structures/
│       └── CommandTemplate.js
│
└── node_modules/
```

---

## Next Steps: Adding More Commands

### 1. Create Command File
Create a new file in appropriate module folder:
```bash
src/commands/2-economy/daily.js
```

### 2. Use Template
```javascript
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('💰 Claim your daily reward'),

    async execute(interaction, client) {
        // Your command logic here
    }
};
```

### 3. Deploy
```bash
npm run deploy-commands -- --guild
```

---

## Performance Optimization Tips

### For Development
```env
NODE_ENV=development
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/fsociety
```

### For Production
```env
NODE_ENV=production
REDIS_URL=redis-cluster-uri
MONGODB_URI=mongodb+srv://production-cluster...
```

---

## Security Checklist

- [ ] `.env` file is in `.gitignore` (never commit tokens)
- [ ] Bot token rotated if accidentally shared
- [ ] Bot has necessary permissions only
- [ ] Rate limiting enabled
- [ ] Input validation on all commands
- [ ] Database backups configured
- [ ] Error logs are monitored
- [ ] HTTPS for any web endpoints

---

## Monitoring Commands

### Check Bot Status
```bash
# See running bot
ps aux | grep node

# Check memory usage
node -e "console.log(process.memoryUsage())"
```

### View Logs
```bash
# Docker logs (if using Docker)
docker logs container_name

# File logs (if saving logs)
tail -f logs/bot.log
```

---

## Scaling Up

### From 1 Guild to 100+ Guilds

1. **Switch to Global Command Deployment**
   - Commands deploy to all servers automatically
   - One-time setup, then update cycle takes 1 hour

2. **Optimize Database**
   - Create indexes on frequently queried fields
   - Set up connection pooling

3. **Add Redis Caching**
   - Install Redis
   - Configure in .env
   - Instant response times

4. **Monitor Performance**
   - Watch command latency
   - Monitor database queries
   - Check memory usage

### Moving to Production

1. Deploy to VPS/Cloud (e.g., Heroku, DigitalOcean)
2. Use managed database (MongoDB Atlas, AWS RDS)
3. Use managed cache (Redis Cloud, AWS ElastiCache)
4. Setup CI/CD pipeline
5. Configure backups and monitoring
6. Use process manager (PM2, forever)

---

## Docker Deployment (Optional)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  bot:
    build: .
    env_file: .env
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine

volumes:
  mongo_data:
```

---

## Getting Help

1. **Documentation**: Read FEATURES_BREAKDOWN.md and ARCHITECTURE.md
2. **Discord.js Docs**: https://discord.js.org/
3. **Stack Overflow**: Tag questions with `discord.js`
4. **GitHub Issues**: Report bugs with reproduction steps

---

## Command Deployment Verification

After deployment, verify commands are available:

```bash
# View deployed commands (global)
curl -H "Authorization: Bot YOUR_TOKEN" \
  https://discordapp.com/api/v10/applications/YOUR_APP_ID/commands

# View guild commands
curl -H "Authorization: Bot YOUR_TOKEN" \
  https://discordapp.com/api/v10/applications/YOUR_APP_ID/guilds/GUILD_ID/commands
```

---

**Happy botting! 🤖** 

For questions, refer to:
- README.md - Overview
- FEATURES_BREAKDOWN.md - 150+ features list
- ARCHITECTURE.md - Technical details
- This file - Setup & deployment

*Last Updated: May 18, 2026*
