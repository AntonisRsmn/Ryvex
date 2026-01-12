# 🤖 Ryvex — Advanced Discord Server Management Bot

**Ryvex** is a modern, slash-command–based Discord bot built for **powerful moderation, detailed logging, and full server control**.
It is designed with a strong focus on **clarity, auditability, stability, and moderator accountability**.

🌐 Website: https://ryvex.gr  
🆘 Support: Use `/support` inside Discord

---

## 🌟 What Is Ryvex?

Ryvex is a **moderation-first Discord bot** that helps server owners and staff:

- 🛡️ **Moderate members safely and consistently**
- 🧾 **Track all actions using a case-based system**
- 🔍 **Audit moderator activity transparently**
- 👋 **Onboard new members with welcome tools**
- 🎮 **Provide lightweight fun & utility commands**

All systems are configurable **per server** using a MongoDB-backed settings service.

No prefixes. No clutter. Everything works through modern `/` slash commands.

---

## ⚙️ Core Systems Overview

## 🧾 Advanced Logging System

Ryvex includes a **robust, event-driven logging system** designed for real moderation workflows.

### Logged Events
- Member joins & leaves
- Member updates (roles, nicknames)
- Message edits & deletions *(privacy-aware)*
- Channel create / update / delete
- Role create / update / delete
- Server (guild) updates
- **All moderation actions (case-based)**

### Privacy & Safety
- Message content logging is **optional**
- Audit logs are fetched **only if permissions allow**
- Graceful fallbacks when permissions are missing
- No crashes or spam when audit logs are unavailable

Logs are automatically separated into:
- **General logs**
- **Moderation logs**

---

## 🛡️ Moderation & Case System

Every moderation action creates a **persistent moderation case** stored in the database.

### Supported Actions
- Ban / Unban
- Kick
- Timeout / Unmute
- Lock / Unlock channels
- Add / Remove roles
- Warnings *(fully managed)*

Each case stores:
- Case ID
- Action type
- Target & moderator
- Reason & duration (if applicable)
- Timestamp

---

## 📂 Case Management Commands

```
/case view <id>
/case edit <id> <reason>
/case delete <id>
```

---

## 🧾 Moderation Logs (`/modlog`)

```
/modlog recent
/modlog user <member>
```

---

## ⚠️ Warning System

```
/warn add <member> [reason]
/warn count <member>
/warn remove <caseId>
/warn clear <member>
```

---

## 👋 Welcome System

- Welcome messages
- Optional auto-role assignment

---

## 🔧 Configuration

```
/settings
/setup
```

---

## 📜 Command Categories

### 🛡️ Moderation
- `/ban`, `/unban`
- `/kick`
- `/timeout`, `/unmute`
- `/lock`, `/unlock`
- `/add-role`, `/remove-role`
- `/clear`

### 🧾 Records
- `/case`
- `/modlog`
- `/warn`

### ⚙️ Configuration
- `/settings`
- `/setup`

### 🎮 Fun
- `/8ball`
- `/rps`
- `/meme`

---

## 🧩 Tech Stack

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
