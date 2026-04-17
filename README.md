# 🤖 **Ryvex** — Moderation You Can Audit, Trust, and Scale

**Ryvex** is a **moderation-first Discord bot** built for servers that care about **staff accountability, transparency, and long-term stability**.

Instead of being a generic “do-everything” bot, Ryvex focuses on:
- **Clear moderation workflows**
- **Case-based actions**
- **Audit-friendly logging**
- **Review-first staff monitoring**

Ryvex is designed so **nothing important happens silently**.

🌐 **Website:** https://ryvex.gr  
🆘 **Support:** `/support` inside Discord  
⚙️ **Setup:** `/setup` (guided, read-only overview)

---

## 🌟 What Is Ryvex?

Ryvex helps server owners and moderation teams:

- 🛡️ Enforce rules **consistently and safely**
- 🧾 Track **every moderation action** with persistent cases
- 🔍 Audit moderator behavior **without spying or auto-punishment**
- 🤖 Automate rule enforcement with **configurable AutoMod**
- 👋 Onboard members cleanly with welcome tools
- ⚙️ Configure everything per-server with **clear, dedicated commands**

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

---

### 🎉 Seasonal Presence System

Ryvex automatically updates its status based on the time of year:

- 🎆 New Year (Jan 1–5)
- 💘 Valentine's Day (Feb 10–16)
- 🤡 April Fools (Apr 1)
- 🐣 Easter (Apr 18–21)
- ☀️ Summer Vibes (Jul–Aug)
- 🎂 Bot Birthday (Sep 1)
- 🎃 Halloween (Oct 25–31)
- 🎄 Christmas (Dec 20–26)
- 🥂 New Year's Eve (Dec 31)
- 👻 Friday the 13th (any occurrence)

On normal days, the bot rotates between `@Ryvex` and server count.

---

## ⚙️ Setup & Configuration

```
/setup
/settings view
```

---

## 🧩 Tech Stack

- Node.js 18+
- discord.js v14 (API v10)
- MongoDB + Mongoose v9

---

## 👤 Author

**Antonis Rusman**  
https://rusman.gr

