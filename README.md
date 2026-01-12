# 🤖 **Ryvex** — Moderation You Can Audit, Trust, and Scale

**Ryvex** is a **moderation-first Discord bot** built for servers that take **staff accountability, transparency, and stability** seriously.

Unlike generic “all-in-one” bots, Ryvex focuses on **clear moderation workflows**, **case-based actions**, and **audit-friendly logging**, making it ideal for servers with multiple moderators and real governance needs.

🌐 **Website:** https://ryvex.gr  
🆘 **Support:** Use `/support` inside Discord  
⚙️ **Setup:** Use `/setup` inside discord to configure the bot

---

## 🌟 What Is Ryvex?

Ryvex helps server owners and moderation teams:

- 🛡️ Enforce rules **consistently and safely**
- 🧾 Track **every moderation action** in a persistent case system
- 🔍 Audit moderator behavior transparently
- 👋 Onboard new members with configurable welcome tools
- ⚙️ Configure everything per-server with zero clutter

**No prefixes. No legacy commands.**  
Everything runs through modern **Discord slash commands**.

---

## 🎯 Who Ryvex Is Built For

Ryvex is designed for:

- Medium to large Discord servers  
- Servers with **multiple moderators**
- Owners who want **visibility into staff actions**
- Communities where **trust and accountability matter**

If you want a “set-and-forget” casual bot, Ryvex is probably not for you — and that’s intentional.

---

## 🧾 Core Systems

### 🧾 Case-Based Moderation System

Every moderation action creates a **persistent case** stored in the database.

**Supported actions:**
- Ban / Unban
- Kick
- Timeout / Unmute
- Lock / Unlock channels
- Add / Remove roles
- Warnings (fully managed)

Each case includes:
- Case ID
- Action type
- Target & moderator
- Reason & duration (if applicable)
- Timestamp

**Case management commands:**
```
/case view <id>
/case edit <id> <reason>
/case delete <id>
```

---

### 🧾 Advanced Logging System

Ryvex uses an **event-driven logging system** designed for real moderation workflows.

**Logged events include:**
- Member joins & leaves
- Member updates (roles, nicknames)
- Message edits & deletions (privacy-aware)
- Channel, role, and server updates
- All moderation actions (case-linked)

**Safety & privacy first:**
- Message content logging is optional
- Audit logs are accessed only when permitted
- Graceful fallbacks when permissions are missing
- No crashes or log spam

Logs are automatically separated into:
- General logs
- Moderation logs

---

### ⚠️ Warning System

```
/warn add <member> [reason]
/warn count <member>
/warn remove <caseId>
/warn clear <member>
```

---

### 👋 Welcome & Onboarding

- Custom welcome messages
- Optional automatic role assignment
- Fully configurable per server

---

## ⚙️ Configuration & Setup

- `/setup` — Initial server setup
- `/settings` — Modify server configuration

---

## 📜 Command Categories

### 🛡️ Moderation
`/ban`, `/unban`, `/kick`, `/timeout`, `/unmute`, `/lock`, `/unlock`, `/add-role`, `/remove-role`, `/clear`

### 🧾 Records
`/case`, `/modlog`, `/warn`

### ⚙️ Configuration
`/setup`, `/settings`

### 🎮 Fun (Optional)
`/8ball`, `/rps`, `/meme`

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
