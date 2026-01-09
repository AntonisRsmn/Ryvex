# 🤖 Ryvex — Advanced Discord Server Management Bot

**Ryvex** is a modern, slash-command–based Discord bot designed to help server owners and moderators **manage, moderate, and monitor** their communities with clarity and control.

🌐 Website: https://ryvex.gr  
🆘 Support: Use `/support` inside Discord

---

## 🌟 What Is Ryvex?

Ryvex is a **multipurpose Discord bot** focused on:

- 🛡️ **Moderation**
- 🧾 **Server & activity logging**
- 👋 **Welcome & onboarding**
- 🎮 **Fun & utility commands**

All features are configurable **per server** using a built-in **settings system** backed by MongoDB.

No prefixes. No clutter. Everything works through `/` slash commands.

---

## ⚙️ Core Systems Overview

### 🧾 Logging System (Admin-Facing)

Ryvex includes a **server logging system** designed for transparency and moderation auditing.

**What gets logged**
- Member joins & leaves
- Channel creation & deletion
- Moderation actions (ban, kick, mute, timeout, etc.)

**What does NOT get logged**
- Message purges (`/clear`)
- Fun commands
- Private interactions

Logs are sent to a **designated log channel** configured via `/settings`.

> Logging is **event-based**, not spammy, and fully optional.

---

### 👋 Welcome System (User-Facing)

The welcome system is separate from logging and is used for onboarding new members.

**Features**
- Send welcome messages to a chosen channel
- Assign an automatic role to new members
- Fully optional and configurable

Welcome messages do **not** interfere with logging.

---

### 🛡️ Moderation System

Ryvex includes a robust moderation system with **built-in safety checks**:

- Role hierarchy enforcement
- Bot permission validation
- Owner & self-action protection
- Proper error handling

Moderation actions are **logged automatically** if logging is enabled.

---

## 🔧 Server Configuration (`/settings`)

Admins can configure Ryvex using:

```
/settings
```

### Available settings groups

#### Logging
```
/settings logging enable
/settings logging disable
/settings logging channel <channel>
```

#### Welcome
```
/settings welcome enable
/settings welcome disable
/settings welcome channel <channel>
/settings welcome autorole <role>
```

---

## 📜 Commands Reference

### 🛡️ Moderation Commands
- `/ban`
- `/kick`
- `/mute`
- `/timeout`
- `/unmute` / `/remove-timeout`
- `/lock` / `/unlock`
- `/add-role` / `/remove-role`
- `/unban`
- `/clear`

### 🎮 Fun Commands
- `/8ball`
- `/compliment`
- `/meme`
- `/gaymeter`, `/ppmeter`
- `/rps`

### ℹ️ Info & Utility
- `/help`
- `/botinfo`
- `/uptime`
- `/userinfo`
- `/poll`
- `/support`
- `/website`
- `/donate`

---

## 🧩 Technical Details

- **Node.js**
- **discord.js (API v10)**
- **MongoDB**
- Slash commands only

---

## 📄 License

MIT License

---

## 👤 Author

**Antonis Rusman**  
https://rusman.gr
