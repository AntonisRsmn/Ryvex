# 🤖 Ryvex — Advanced Discord Server Management Bot

**Ryvex** is a modern, slash-command–based Discord bot built for **powerful moderation, detailed logging, and server control**.
It focuses on **clarity, auditability, and safety** for server owners and moderation teams.

🌐 Website: https://ryvex.gr  
🆘 Support: Use `/support` inside Discord

---

## 🌟 What Is Ryvex?

Ryvex is a **moderation-first Discord bot** designed to help communities:

- 🛡️ **Moderate members safely**
- 🧾 **Track actions with case-based logs**
- 🔍 **Audit staff actions transparently**
- 👋 **Onboard new members cleanly**
- 🎮 **Provide lightweight fun & utility commands**

All features are configurable **per server** using a MongoDB-backed settings system.

No prefixes. No clutter. Everything runs through `/` slash commands.

---

## ⚙️ Core Systems Overview

### 🧾 Advanced Logging System

Ryvex includes a **fully event-based logging system** built for transparency.

#### Logged events
- Member joins & leaves
- Member updates (roles, nicknames)
- Message edits & deletions *(privacy-aware)*
- Channel create / update / delete
- Role create / update / delete
- Server (guild) updates
- **All moderation actions** (case-based)

#### Privacy & Safety
- Message content logging is **optional**
- Audit logs are fetched **only if the bot has permission**
- Graceful fallbacks when permissions are missing

Logs are automatically routed to:
- **General logs**
- **Moderation logs**

---

### 🛡️ Moderation & Case System

Every moderation action generates a **persistent case** stored in the database.

#### Supported actions
- Ban / Unban
- Kick
- Timeout / Unmute
- Lock / Unlock channels
- Add / Remove roles
- Warnings *(with management tools)*

Each case stores:
- Case ID
- Action type
- Target & moderator
- Reason & duration (if applicable)
- Timestamp

---

### 📂 Case Management

Moderators can fully manage moderation history:

```
/case view <id>
/case edit <id> <reason>
/case delete <id>
```

---

### 🧾 Moderation Logs (`/modlog`)

```
/modlog recent
/modlog user <member>
```

Features:
- Paginated user history
- Case jump references
- Clean, readable embeds
- Action-based formatting

---

### ⚠️ Warning System

```
/warn add <member> [reason]
/warn count <member>
/warn remove <caseId>
/warn clear <member>
```

---

### 👋 Welcome System

- Welcome messages
- Optional auto-role assignment

---

## 🔧 Server Configuration (`/settings`)

### Logging
```
/settings logging enable
/settings logging disable
/settings logging channel <channel>
```

### Welcome
```
/settings welcome enable
/settings welcome disable
/settings welcome channel <channel>
/settings welcome autorole <role>
```

---

## 📜 Commands Overview

### 🛡️ Moderation
- `/ban`, `/unban`
- `/kick`
- `/timeout`, `/unmute`
- `/lock`, `/unlock`
- `/add-role`, `/remove-role`
- `/warn`
- `/case`
- `/modlog`
- `/clear`

### 🎮 Fun
- `/8ball`, `/rps`, `/meme`

### ℹ️ Info
- `/help`, `/botinfo`, `/uptime`, `/support`

---

## 🧩 Tech

- Node.js
- discord.js (API v10)
- MongoDB

---

## 📄 License

MIT License

---

## 👤 Author

**Antonis Rusman**  
https://rusman.gr