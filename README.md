# 🤖 Ryvex — Moderation You Can Audit, Trust, and Scale

**Ryvex** is a **moderation-first Discord bot** built for servers that take  
**staff accountability, transparency, and operational stability** seriously.

Unlike generic “all-in-one” bots, Ryvex focuses on **clear moderation workflows**,  
**case-based actions**, and **audit-friendly logging**, making it ideal for servers  
with multiple moderators and real governance needs.

🌐 **Website:** https://ryvex.gr  
🆘 **Support:** Use `/support` inside Discord  
⚙️ **Setup:** Use `/setup` inside Discord to configure the bot

---

## 🌟 What Is Ryvex?

Ryvex helps server owners and moderation teams:

- 🛡️ Enforce rules **consistently and safely**
- 🧾 Track **every moderation action** with a persistent case system
- 🔍 Audit moderator behavior transparently
- 🤖 Automatically moderate spam, links, and bad language
- 👋 Onboard new members with configurable welcome tools
- ⚙️ Configure everything per-server with **zero clutter**

**No prefixes. No legacy commands.**  
Everything runs through modern **Discord slash commands**.

---

## 🎯 Who Ryvex Is Built For

Ryvex is designed for:

- Medium to large Discord servers  
- Servers with **multiple moderators**
- Owners who want **visibility into staff actions**
- Communities where **trust and accountability matter**

If you want a “set-and-forget” casual bot, Ryvex is probably **not** for you —  
and that’s intentional.

---

## 🧾 Core Systems

### 🧾 Case-Based Moderation System

Every moderation action creates a **persistent case** stored in the database.

**Supported actions:**
- Ban / Unban
- Kick
- Timeout / Untimeout
- Lock / Unlock channels
- Add / Remove roles
- Warnings
- AutoMod actions (spam, links, bad language)

Each case includes:
- Case ID
- Action type
- Target & moderator
- Reason & duration (if applicable)
- Timestamp

---

## ⚙️ Configuration & Setup

- `/setup` — Guided setup dashboard
- `/settings` — Modify server configuration

---

## 📜 Command Categories

### 🛡️ Moderation
`/ban`, `/unban`, `/kick`, `/timeout`, `/lock`, `/unlock`, `/clear`

### 🧾 Records
`/case`, `/modlog`, `/warn`

### 🤖 AutoMod
`/automod`, `/automod-channel`, `/automod-punishment`, `/automod-roles`, `/automod-badwords`

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
🌐 https://rusman.gr
