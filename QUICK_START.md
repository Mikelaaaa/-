# ⚡ QUICK START CHECKLIST

**Get FSOCIETY bot running in 15 minutes!**

---

## ✅ PREREQUISITES

Before starting, make sure you have:
- [ ] Node.js 16.9.0+ installed (`node --version`)
- [ ] npm 8.0.0+ installed (`npm --version`)
- [ ] Discord Developer Portal account
- [ ] MongoDB URI (or PostgreSQL connection string)
- [ ] Redis URL (optional, for caching)

---

## 🎯 STEP-BY-STEP SETUP (15 min)

### Step 1: Discord Bot Setup (3 min)
- [ ] Go to https://discord.com/developers/applications
- [ ] Click "New Application" and name it "FSOCIETY"
- [ ] Go to "Bot" section → "Add Bot"
- [ ] Copy the TOKEN (you'll need this)
- [ ] Go to "OAuth2" → "URL Generator"
- [ ] Select scopes: `bot`
- [ ] Select permissions: `Administrator` (for testing)
- [ ] Copy the generated URL
- [ ] Open URL in browser and select your test server
- [ ] Bot should appear in your Discord server

### Step 2: Environment Setup (2 min)
- [ ] Copy `.env.example` to `.env`
- [ ] Open `.env` in your editor
- [ ] Fill in required variables:
```env
DISCORD_TOKEN=your_bot_token_here
APPLICATION_ID=your_app_id_from_portal
GUILD_ID=your_test_server_id
MONGODB_URI=mongodb://localhost:27017/fsociety
REDIS_URL=redis://localhost:6379
```
- [ ] Save `.env` file

### Step 3: Dependencies Installation (5 min)
- [ ] Open terminal in project directory
- [ ] Run: `npm install`
- [ ] Wait for all packages to install
- [ ] You should see 25+ packages installed

### Step 4: Database Setup (2 min)
Choose ONE database option:

**Option A: MongoDB (Recommended for first-time)**
```bash
# Install MongoDB locally OR use MongoDB Atlas
# For local: Download from https://www.mongodb.com/try/download/community
# For cloud: Create account at https://www.mongodb.com/cloud/atlas
# Add connection string to .env MONGODB_URI
```

**Option B: PostgreSQL (Optional)**
```bash
# Install PostgreSQL from https://www.postgresql.org/download/
# Create database: createdb fsociety
# Update DATABASE_URL in .env
```

**Option C: Skip for now**
```bash
# Bot will work without database for testing
# Some features will be disabled
```

### Step 5: Redis Setup (1 min - Optional)
```bash
# Install Redis from https://redis.io/download
# For Windows: Use WSL or Docker
# Or skip - bot works without caching (slower performance)
```

---

## 🚀 LAUNCH THE BOT

### First Start
```bash
npm run dev
```

### Expected Output
```
[12:34:56] ℹ ✅ Bot logged in as FSOCIETY#0000
[12:34:56] 📊 Serving 1 guilds
[12:34:56] 👥 Total users: 50
[12:34:56] 🗄️ Database connected successfully
[12:34:56] ⚡ Redis cache connected successfully
[12:34:56] 📂 Commands loaded successfully
[12:34:56] 🎯 Events loaded successfully
```

---

## 📝 DEPLOY COMMANDS

### For Guild Testing (FAST - Recommended)
```bash
npm run deploy-commands -- --guild
```

**Expected time**: 1-2 seconds

### For Global Deployment (SLOW - Production only)
```bash
npm run deploy-commands
```

**Expected time**: 30 min - 1 hour (Discord rate limiting)

---

## ✅ VERIFY INSTALLATION

### Check 1: Bot is Online
- [ ] Bot appears as online in Discord
- [ ] Bot status shows "Playing with commands"

### Check 2: Test Example Command
- [ ] In Discord, type: `/serverinfo`
- [ ] Bot should respond with server statistics
- [ ] If it works, installation is successful! 🎉

### Check 3: Test Other Commands
Try these example commands:
- [ ] `/balance` - Check economy balance
- [ ] `/warn` - Warn a user (Mod test)
- [ ] `/profile` - Check RPG profile
- [ ] `/ticket create` - Create support ticket
- [ ] `/giveaway list` - List active giveaways

---

## 🛠️ COMMON ISSUES & FIXES

### "Bot doesn't respond to commands"
```
❌ Issue: Commands not deployed
✅ Fix: Run npm run deploy-commands -- --guild
```

### "Discord token invalid"
```
❌ Issue: Wrong token in .env
✅ Fix: Copy new token from Developer Portal → Bot section
```

### "MongoDB connection failed"
```
❌ Issue: Database not running or wrong URI
✅ Fix: Start MongoDB or update MONGODB_URI in .env
```

### "Redis connection failed"
```
❌ Issue: Redis not running (optional)
✅ Fix: Start Redis or set REDIS_URL=null in .env
```

### "Commands appear but bot doesn't respond"
```
❌ Issue: Missing intents or permissions
✅ Fix: Check bot has Administrator permission in server
```

---

## 📚 NEXT STEPS

### After Successful Setup
1. **Read** `README.md` for project overview
2. **Review** `DEVELOPER_REFERENCE.md` for code patterns
3. **Check** example commands in `src/commands/`
4. **Start** implementing Phase 2 commands

### Creating Your First Command
1. Copy `src/structures/CommandTemplate.js`
2. Create new file in appropriate module folder
3. Follow the template pattern
4. Run `npm run deploy-commands -- --guild`
5. Test in Discord

### Implementation Order (Recommended)
- Week 1: Moderation (warn, mute, kick, ban, etc.)
- Week 2: Economy (balance, work, transfer, shop, etc.)
- Week 3: RPG (profile, level, skills, quest, etc.)
- Week 4: Others (ticketing, logging, utilities, music, etc.)

---

## 💾 FILE LOCATIONS QUICK REFERENCE

| What | Where |
|------|-------|
| Main bot file | `index.js` |
| Commands | `src/commands/[module]/` |
| Events | `src/events/` |
| Database | `src/database/` |
| Caching | `src/cache/` |
| Utilities | `src/utils/` |
| Configuration | `.env` |

---

## 🔗 USEFUL LINKS

| Resource | Link |
|----------|------|
| Discord.js Docs | https://discord.js.org/ |
| Discord.js Guide | https://discordjs.guide/ |
| MongoDB Docs | https://docs.mongodb.com/ |
| Redis Docs | https://redis.io/docs/ |
| Node.js Docs | https://nodejs.org/docs/ |

---

## ⏱️ TIMING BREAKDOWN

| Task | Time | Notes |
|------|------|-------|
| Discord Bot Setup | 3 min | One-time |
| Environment Config | 2 min | One-time |
| npm install | 5 min | One-time |
| Database Setup | 2 min | Optional |
| Bot Startup | 1 min | Every time |
| Command Deployment | 1-2 sec | Every update |
| **Total** | **15 min** | **First time** |

---

## ✨ SUCCESS CRITERIA

You've successfully completed setup when:

✅ Bot appears online in Discord  
✅ `/serverinfo` command works  
✅ All example commands respond  
✅ No errors in console  
✅ Database connected (if set up)  
✅ Cache connected (if set up)  

---

## 🎓 LEARNING PATH

### Day 1: Setup
- [ ] Complete this checklist
- [ ] Get bot online
- [ ] Verify example commands work

### Day 2: Understanding
- [ ] Read ARCHITECTURE.md
- [ ] Study example commands
- [ ] Review database models

### Day 3-5: Development
- [ ] Implement 5-10 new commands
- [ ] Follow code patterns
- [ ] Test thoroughly

### Week 2+: Scaling
- [ ] Implement remaining commands
- [ ] Optimize performance
- [ ] Deploy to production

---

## 🆘 NEED HELP?

### Check These Files First
1. `README.md` - General overview
2. `SETUP_GUIDE.md` - Detailed setup
3. `DEVELOPER_REFERENCE.md` - Code patterns
4. `ARCHITECTURE.md` - System design

### Additional Help
- Reread the step that failed
- Check console for error messages
- Review example commands for patterns
- Check Discord.js documentation

---

## 🎉 YOU'RE READY!

You now have:
✅ Production-ready bot framework  
✅ 6 example commands working  
✅ Database integration ready  
✅ Caching system configured  
✅ 150+ features specified  
✅ Complete documentation  

**Next**: Implement your 144 remaining commands! 🚀

---

## 📋 FINAL CHECKLIST

- [ ] Node.js 16.9.0+ installed
- [ ] npm 8.0.0+ installed
- [ ] Discord bot created
- [ ] Bot token copied to .env
- [ ] Application ID in .env
- [ ] Guild ID in .env
- [ ] Database URI in .env
- [ ] npm install completed
- [ ] Commands deployed
- [ ] Example commands working
- [ ] No console errors

**If all checked**: You're ready to go! 🎊

---

**Time to complete this checklist**: 15 minutes  
**Difficulty**: ⭐⭐ Easy  
**Next**: Start implementing commands!

**Happy coding!** 🚀
