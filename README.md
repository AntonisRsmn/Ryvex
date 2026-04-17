# 🤖 **Ryvex** — Moderation You Can Audit, Trust, and Scale

**Ryvex** is a **moderation-first Discord bot** built for servers that care about **staff accountability, transparency, and long-term stability**.

Instead of being a generic “do-everything” bot, Ryvex focuses on:
- **Clear moderation workflows**
- **Case-based actions**
- **Audit-friendly logging**
- **Review-first staff monitoring**
- **Rich interactive dashboards** with paginated embeds

Ryvex is designed so **nothing important happens silently**.

🌐 **Website:** https://ryvex.gr  
🆘 **Support:** `/support` inside Discord  
⚙️ **Setup:** `/setup` (17-page interactive guide)

---

## 🌟 What Is Ryvex?

Ryvex helps server owners and moderation teams:

- 🛡️ Enforce rules **consistently and safely**
- 🧾 Track **every moderation action** with persistent cases
- 🔍 Audit moderator behavior **without spying or auto-punishment**
- 🤖 Automate rule enforcement with **configurable AutoMod**
- �️ Protect against raids with **anti-raid detection**
- 👋 Onboard members cleanly with welcome tools
- 🎭 Let members **self-assign roles** with Reaction Roles
- 📊 Engage your community with a **Leveling/XP system**
- 💤 Set yourself **AFK** and get notified when mentioned
- 🎮 Have fun with **8ball, memes, RPS, and more**
- ⚙️ Configure everything per-server with **rich interactive dashboards**
- ⭐ Encourage feedback with the `/review` command (Top.gg)

**No prefixes. No legacy commands.**  
Everything uses modern **Discord slash commands**.

---

## 🎯 Who Ryvex Is Built For

Ryvex is designed for:

- Medium to large Discord servers
- Servers with **multiple moderators**
- Owners who want **visibility into staff actions**
- Communities where **trust and accountability matter**

If you want a “set-and-forget casual bot”, Ryvex is probably **not** for you — by design.

---

## 🧾 Core Systems

### 🧾 Case-Based Moderation System

Every moderation action creates a **persistent case** stored in MongoDB.

**Supported actions**
- Warn / Remove warnings / Clear warnings
- Timeout / Untimeout
- Kick
- Ban / Unban
- Clear messages
- Lock / Unlock channels
- Add / Remove roles

**Case commands**
```
/case view <id>
/case edit <id> <reason>
/case delete <id>
```

---

### 📜 Advanced Logging System

- Member joins & leaves
- Message edits & deletions (privacy-aware)
- Channel, role, and server changes
- All moderation actions (case-linked)

Logs are separated into:
- General logs
- Moderation logs

---

### ⚠️ Warning System
```
/warn add <member>
/warn count <member>
/warn remove <caseId>
/warn clear <member>
```

---

### 🤖 AutoMod System

- Spam detection
- Link protection
- Bad-word filtering
- Presets & escalation
- Channel & role bypasses

---

### 📨 Appeals System

```
/appeal
/appeal-admin config
/appeal-admin close
/appeal-admin reopen
```

---

### 👋 Welcome System

```
/welcome enable
/welcome channel <channel>
/welcome autorole <role>
```

---

### 🧑‍⚖️ Staff Accountability

```
/staff dashboard
/staff-flags enable
/staff-flags check
/staff-flags history
```

---

### 📜 Rules System

Structured, configurable rules integrated into setup & moderation.

```
/rules             — View paginated server rules (3 per page)
/rules-admin add   — Add a rule
/rules-admin edit  — Edit a rule
/rules-admin remove — Remove a rule
```

---

### 🛡️ Anti-Raid System

Protect your server from mass join attacks:

```
/antiraid
```

- Configurable join-rate thresholds
- Automatic detection and response
- Integrates with logging system

---

### ⏱️ Slowmode

```
/slowmode <seconds>
```

- Set slowmode on any text channel
- Case-logged moderation action

---

### 💤 AFK System

```
/afk [reason]
```
- Toggle AFK on/off
- Auto-removes AFK when you send a message
- Notifies users who mention someone who is AFK

---

### 🎭 Reaction Roles

```
/reactionrole create <channel> [title] [message]
/reactionrole add <messageId> <role> <emoji> [label]
/reactionrole remove <messageId> <role>
/reactionrole delete <messageId>
/reactionrole list
```
- Button-based role panels (no emoji reactions needed)
- Custom embed title and description
- Add/remove roles per panel

---

### 📊 Leveling / XP System

```
/rank [@user]
/leaderboard [page]
```

**Admin commands:**
```
/xp enable
/xp disable
/xp channel <channel>
/xp rolereward <level> <role>
/xp removerolereward <level>
/xp amount <min> <max>
/xp cooldown <seconds>
/xp set <user> <xp>
/xp reset <user>
/xp settings
```

- Members earn random XP per message (configurable min/max)
- Cooldown between XP gains (configurable)
- Level-up announcements (optional dedicated channel)
- Automatic role rewards on level-up
- Server leaderboard with paginated top-5

---

### 🎉 Seasonal Presence System

Ryvex automatically updates its status based on the time of year:

- 🎆 New Year (Jan 1–5)
- 💘 Valentine's Day (Feb 10–16)
- 🤡 April Fools (Apr 1)
- 🐣 Easter (auto-calculated yearly, Good Friday → Easter Monday)
- ☀️ Summer Vibes (Jul–Aug)
- 🎂 Bot Birthday (Sep 1)
- 🎃 Halloween (Oct 25–31)
- 🎄 Christmas (Dec 20–26)
- 🥂 New Year's Eve (Dec 31)
- 👻 Friday the 13th (any occurrence)

On normal days, the bot rotates between `@Ryvex` and server count.

---

### ⭐ Review Command

```
/review
```
- Links directly to Ryvex's Top.gg review page
- Ephemeral response (only visible to the user)

---

### 🎮 Fun Commands

```
/8ball <question>   — Ask the magic 8-ball
/compliment         — Get a random compliment
/gaymeter [@user]   — Measure gay energy 🌈
/meme               — Get a random meme
/ppmeter [@user]    — Measure PP energy 📏
/rps <choice>       — Rock, Paper, Scissors
```

---

### 🛡️ Crash Protection & Stability

Ryvex is built to **never crash** in production:

- All event handlers wrapped in try/catch
- All database services wrapped with safe fallbacks
- All utilities (logging, automod) wrapped with error isolation
- Global `unhandledRejection` and `uncaughtException` handlers
- Automatic cache sweepers prevent memory leaks over long uptime
- Periodic spam tracker cleanup prevents memory buildup

---

## ⚙️ Setup & Configuration

```
/setup          — 17-page interactive setup guide covering all systems
/settings view  — 10-page interactive dashboard showing all current config
```

Both commands use paginated embeds with ◀ ▶ navigation buttons.

---

## 📋 Full Command Reference (54 commands)

| Category | Commands |
|---|---|
| **Moderation** | `/ban`, `/kick`, `/timeout`, `/untimeout`, `/unban`, `/clear`, `/lock`, `/unlock`, `/slowmode`, `/add-role`, `/remove-role`, `/appeal-admin` |
| **Audit** | `/case`, `/warn`, `/staff`, `/staff-flags`, `/history-user`, `/history-staff`, `/rules-admin` |
| **AutoMod** | `/automod`, `/automod-badwords`, `/automod-channel`, `/automod-punishment`, `/automod-roles` |
| **Config** | `/setup`, `/settings`, `/logging`, `/moderation`, `/welcome`, `/reactionrole`, `/xp`, `/antiraid` |
| **Info** | `/botinfo`, `/userinfo`, `/help`, `/changelog`, `/history`, `/rules`, `/ping`, `/poll`, `/rank`, `/leaderboard`, `/appeal`, `/review`, `/donate`, `/support`, `/website` |
| **Fun** | `/8ball`, `/afk`, `/compliment`, `/gaymeter`, `/meme`, `/ppmeter`, `/rps` |

---

## 🧩 Tech Stack

- Node.js 18+
- discord.js v14 (API v10)
- MongoDB + Mongoose v9

---

## 👤 Author

**Antonis Rusman**  
https://rusman.gr

