# 🤖 Ryvex — Professional Discord Moderation, Done Right

**Ryvex** is a **moderation-first Discord bot** built for servers that value  
**accountability, transparency, and long-term stability**.

It is designed for **real moderation teams**, not just casual servers — with  
a strong focus on **auditability**, **clean workflows**, and **zero ambiguity**.

🌐 Website: https://ryvex.gr  
🆘 Support: `/support` inside Discord  
⚙️ Setup: `/setup` (guided, safe, read-only)

---

## 🚀 Why Ryvex?

Most moderation bots try to do *everything*.  
Ryvex does **moderation properly**.

### Ryvex is built around:
- 🧾 **Case-based moderation** (every action is recorded)
- 🛡️ **AutoMod you can actually control**
- 🔍 **Transparent staff activity**
- ⚙️ **Per-server, per-channel, per-role configuration**
- 🧠 **Predictable behavior — no hidden automations**

---

## 🧾 Case-Based Moderation System

Every moderation action creates a **persistent case** stored in MongoDB.

### Supported actions
- Warn / Clear / Remove warnings
- Timeout / Untimeout
- Kick
- Ban / Unban
- Lock / Unlock channels
- Role add / remove
- AutoMod actions

Each case includes:
- Case ID
- Action type
- Target & moderator
- Reason & duration
- Timestamp

---

## 🤖 AutoMod System

- Spam detection
- Link blocking
- Bad word filtering
- Presets (Soft / Medium / Strict)
- Channel & role bypasses
- Sticky punishment escalation

Commands:
```bash
/automod
/automod-channel
/automod-punishment
/automod-roles
/automod-badwords
```

---

## 📜 Logging System

- General logs
- Moderation logs
- Privacy-aware message logging
- Audit log correlation

---

## ⚙️ Setup

```bash
/setup
/settings view
```

---

## 🧩 Tech Stack

- Node.js
- discord.js (API v10)
- MongoDB

---

## 👤 Author

**Antonis Rusman**  
https://rusman.gr
