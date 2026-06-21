# FSOCIETY DEVELOPER QUICK REFERENCE

## File Locations

| File | Purpose |
|------|---------|
| `index.js` | Main bot entry point |
| `src/handlers/CommandHandler.js` | Command loading & deployment |
| `src/handlers/EventHandler.js` | Event loading |
| `src/database/DatabaseManager.js` | DB abstraction layer |
| `src/cache/CacheManager.js` | Redis caching |
| `src/utils/Logger.js` | Logging utility |
| `src/utils/RateLimiter.js` | Rate limiting |
| `src/utils/Helpers.js` | Common utilities |

---

## Quick Command Creation

```javascript
// 1. Create file: src/commands/MODULE/commandname.js
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmdname')
        .setDescription('Description'),

    async execute(interaction, client) {
        await interaction.deferReply();
        // Your code here
    }
};

// 2. Deploy: npm run deploy-commands -- --guild
// 3. Test in Discord: /cmdname
```

---

## Client Object Available Properties

```javascript
client.commands         // Map of all commands
client.subcommands     // Map of subcommands
client.buttons         // Map of button handlers
client.selectMenus     // Map of select menu handlers
client.modals          // Map of modal handlers
client.cooldowns       // Map for cooldown tracking
client.logger          // Logger instance
client.db              // DatabaseManager instance
client.cache           // CacheManager instance
client.rateLimiter     // RateLimiter instance
```

---

## Common Operations

### Get User Data
```javascript
const user = await client.db.getUser(guildId, userId, client.cache);
```

### Update User
```javascript
await client.db.updateUser(guildId, userId, { balance: 500 }, client.cache);
```

### Get Guild Settings
```javascript
const settings = await client.db.getGuildSettings(guildId, client.cache);
```

### Add Warning
```javascript
await client.db.addWarning(guildId, userId, reason, moderatorId);
```

### Create Transaction
```javascript
await client.db.createTransaction(fromId, toId, amount, 'transfer', 'desc');
```

### Check Rate Limit
```javascript
if (client.rateLimiter.isLimited(key)) {
    // User is rate limited
}
```

### Cache Operations
```javascript
await client.cache.set(key, value, ttl); // ttl in seconds
const value = await client.cache.get(key);
await client.cache.del(key);
```

---

## Embed Quick Builder

```javascript
const embed = new EmbedBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .addFields(
        { name: 'Field1', value: 'Value1', inline: true },
        { name: 'Field2', value: 'Value2', inline: false }
    )
    .setColor(Colors.Green)
    .setTimestamp();

await interaction.editReply({ embeds: [embed] });
```

---

## Button/Select Menu Quick Builder

```javascript
const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('btn_id')
        .setLabel('Click Me')
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('btn_id2')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
);

await interaction.editReply({ 
    embeds: [embed],
    components: [buttons]
});
```

---

## Helper Functions

```javascript
const { EmbedHelper, TimeHelper, StringHelper, ValidationHelper } = 
    require('../../utils/Helpers');

// Embeds
EmbedHelper.success(title, description, fields)
EmbedHelper.error(title, description, fields)
EmbedHelper.info(title, description, fields)
EmbedHelper.warning(title, description, fields)

// Time
TimeHelper.formatTime(milliseconds)     // "1h 30m"
TimeHelper.parseDuration('1h30m')       // milliseconds
TimeHelper.getTimestamp()               // current Unix time

// String
StringHelper.capitalize(str)
StringHelper.truncate(str, length)
StringHelper.generateRandom(10)

// Validation
ValidationHelper.isValidEmail(email)
ValidationHelper.isValidURL(url)
ValidationHelper.isValidLength(str, min, max)
```

---

## Logging

```javascript
client.logger.info('Message here');
client.logger.success('Success message');
client.logger.warn('Warning message');
client.logger.error('Error message', error);
client.logger.debug('Debug message'); // Only in development
```

---

## Module Structure

```
src/commands/
├── 1-moderation/      (15 commands)
├── 2-economy/         (15 commands)
├── 3-rpg/             (15 commands)
├── 4-ticketing/       (15 commands)
├── 5-logging/         (15 commands)
├── 6-utility/         (15 commands)
├── 7-music/           (15 commands)
├── 8-giveaways/       (15 commands)
├── 9-autoroles/       (15 commands)
└── 10-servermanagement/ (15 commands)
```

---

## Database Models Quick Access

```javascript
const {
    User,
    Guild,
    Warning,
    Ticket,
    Transaction,
    Giveaway,
    ModLog,
    MessageLog,
    Shop,
    Quest
} = require('../../database/models');

// Query example
const user = await User.findOne({ guildId, userId });
const warnings = await Warning.find({ guildId, userId });
const topUsers = await User.find({ guildId }).sort({ xp: -1 }).limit(10);
```

---

## Common Permissions

```javascript
'ViewChannel'              // See channel
'SendMessages'             // Send messages
'ManageMessages'           // Delete/edit others' messages
'ManageChannels'           // Edit channel
'ManageRoles'              // Manage roles
'ManageGuild'              // Manage server
'ModerateMembers'          // Mute/timeout/ban
'Administrator'            // Admin access
```

---

## Error Handling Pattern

```javascript
try {
    // Do something
    await interaction.deferReply();
    
    // Check permissions
    if (!interaction.member.permissions.has('PERMISSION')) {
        return interaction.editReply('❌ No permission');
    }
    
    // Execute logic
    const result = await doSomething();
    
    // Send success
    await interaction.editReply({
        embeds: [EmbedHelper.success('Success', result)]
    });
    
} catch (error) {
    client.logger.error('Command error:', error);
    await interaction.editReply({
        embeds: [EmbedHelper.error('Error', 'An error occurred')]
    });
}
```

---

## Commands Deployment

```bash
# Guild only (FAST - 1 second, for testing)
npm run deploy-commands -- --guild

# Global (SLOW - 1 hour, for production)
npm run deploy-commands

# Verify deployment
curl -H "Authorization: Bot TOKEN" \
  https://discord.com/api/v10/applications/APP_ID/commands
```

---

## Environment Variables

```env
DISCORD_TOKEN=        # Required
APPLICATION_ID=       # Required
GUILD_ID=             # Required for --guild deployment
DB_TYPE=mongodb       # mongodb or postgresql
MONGODB_URI=          # MongoDB connection
REDIS_URL=            # Redis connection (optional)
NODE_ENV=development  # development or production
```

---

## Performance Tips

✅ Use `cache` parameter in all DB calls
✅ Check cache before DB queries
✅ Batch database operations
✅ Use `lean()` for MongoDB reads
✅ Implement pagination for lists
✅ Use rate limiting
✅ Defer replies for slow operations
✅ Cache expensive computations

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Commands not showing | Redeploy: `npm run deploy-commands -- --guild` |
| Database error | Check MongoDB running, MONGODB_URI correct |
| Redis error | Optional - bot works without it (slower) |
| Token invalid | Get new token from Developer Portal |
| Permissions denied | Check bot role > target user role |
| Slow response | Enable caching, check database query |

---

## Testing Locally

```bash
# 1. Start bot
npm run dev

# 2. Test in Discord
/command-name

# 3. Check logs for errors
# Look for [HH:MM:SS] in console

# 4. Monitor performance
# Command time should be < 100ms

# 5. Verify data persistence
# Check MongoDB for saved data
```

---

## Command Template Checklist

- [ ] Command has name (lowercase, no spaces)
- [ ] Command has description (clear, < 100 chars)
- [ ] Command defers reply for safety
- [ ] Command has error handling (try-catch)
- [ ] Command checks permissions if needed
- [ ] Command uses logger for important events
- [ ] Command response is formatted as embed
- [ ] Command uses helper functions
- [ ] Command validates input
- [ ] Command implements rate limiting if needed

---

## Subcommand Pattern

```javascript
data: new SlashCommandBuilder()
    .setName('parent')
    .addSubcommandGroup(group =>
        group
            .setName('group')
            .addSubcommand(sub =>
                sub
                    .setName('child')
                    .setDescription('...')
            )
    )

// In execute:
const group = interaction.options.getSubcommandGroup();
const subcommand = interaction.options.getSubcommand();
```

---

## Module Statistics

| Module | Commands | Features |
|--------|----------|----------|
| 1. Moderation | 15 | Anti-spam, anti-phishing, raid protection |
| 2. Economy | 15 | Trading, stocks, banking |
| 3. RPG | 15 | Leveling, quests, boss fights |
| 4. Ticketing | 15 | Support system, transcripts |
| 5. Logging | 15 | Audit trails, compliance |
| 6. Utility | 15 | APIs, weather, translation |
| 7. Music | 15 | Streaming, filters, playlists |
| 8. Giveaways | 15 | Contests, trivia, events |
| 9. Auto-Roles | 15 | Verification, role rewards |
| 10. Management | 15 | Server stats, backups |

**Total: 150+ Commands**

---

## Resources

- **Discord.js Docs**: https://discord.js.org/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Redis Docs**: https://redis.io/docs/
- **Full Documentation**: See README.md, ARCHITECTURE.md, FEATURES_BREAKDOWN.md

---

## Quick Links

- Architecture Deep-Dive: `ARCHITECTURE.md`
- Feature List: `FEATURES_BREAKDOWN.md`
- Setup Instructions: `SETUP_GUIDE.md`
- Implementation Plan: `IMPLEMENTATION_ROADMAP.md`
- Project Overview: `PROJECT_SUMMARY.md`

---

**Last Updated**: May 18, 2026
**Version**: 1.0.0
