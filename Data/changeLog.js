/**
 * Ryvex Changelog
 * ----------------
 * IMPORTANT RULES:
 * • Newest version MUST be first (index 0)
 * • This file is the SINGLE SOURCE OF TRUTH for versions
 * • /changelog and /botinfo both read from here
 */

 // {
  // version: "1.9.2",
  // date: "2026-02-01",
  // changes: [
  //   "✨ New feature here",
  //   "🐛 Bug fixes",
  // ],
  // },

module.exports = [

  {
    version: "1.9.6",
    date: "2026-01-25",
    changes: [
      "🧭 Expanded `/setup` into a full system overview with step-by-step status pages",
      "📜 Added Rules system visibility to setup with clear configuration guidance",
      "👋 Improved Welcome system integration and status reporting",
      "🤖 Added detailed AutoMod overview pages (core + advanced configuration)",
      "🧑‍⚖️ Introduced Staff Monitoring overview inside setup",
      "📊 Added Staff Accountability Dashboard with activity summaries by time range",
      "🚨 Implemented Staff Activity Monitoring with manual anomaly detection",
      "⚙️ Added configurable staff monitoring thresholds with reset support",
      "🧠 Added alert history and suppression to prevent repeated staff flags",
      "🎨 Unified embed-based UX across staff, monitoring, and setup commands",
      "🧹 Removed legacy setup/meta flags in favor of real-time system status",
      "🔍 Improved clarity between member-facing and moderator-only systems"
    ],
  },

  {
    version: "1.9.5",
    date: "2026-01-24",
    changes: [
      "📨 Introduced a full Appeals system with member and moderator separation",
      "🙋 Members can now open private appeals using `/appeal`",
      "🛠️ Added `/appeal-admin` for moderators with config, close, and reopen controls",
      "🔒 Appeals use private threads with proper locking and archiving lifecycle",
      "⏱️ Added configurable appeal cooldown to prevent abuse",
      "📊 Added appeal visibility and guidance to the `/setup` command",
      "📄 Introduced `/history` command for members to view their own moderation history",
      "🎨 Standardized appeal and history messages using rich embeds",
      "🧭 Improved moderation UX consistency across history, appeals, and setup",
      "⚠️ Fixed deprecated Discord interaction options (`ephemeral`, `fetchReply`)",
      "🧠 Internal stability and UX refinements across moderation-related commands"
    ],
  },

  {
    version: "1.9.4",
    date: "2026-01-23",
    changes: [
      "🛡️ Introduced a fully rebuilt AutoMod system (spam, links, bad words)",
      "⚙️ Added AutoMod presets: Soft / Medium / Strict",
      "🎛️ Added `/automod filters` subcommand to toggle spam, link, and bad-word filters individually",
      "📍 Implemented channel-based AutoMod bypass rules",
      "🧩 Added role-based AutoMod bypass system",
      "⚖️ Introduced configurable punishment escalation with warn-only and timed timeouts",
      "⏱️ Added progressive timeout escalation with sticky maximum punishment",
      "🤬 Added custom bad-words management with enable / disable support",
      "📊 Unified `/automod status` dashboard with full AutoMod visibility",
      "🧭 Integrated AutoMod configuration overview into the `/setup` guided flow",
      "🧹 Improved AutoMod spam cleanup with reduced General Log noise",
      "🧠 Stability, performance, and reliability improvements across AutoMod checks"
    ],
  },

  {
    version: "1.9.3",
    date: "2026-01-15",
    changes: [
      "✨ Major UX overhaul across commands with cleaner, more consistent embeds",
      "🧭 Redesigned `/help` command with improved layout, spacing, and emoji-enhanced categories",
      "🎨 Improved embed readability for `/donate`, `/support`, `/website`, `/userinfo`, and `/poll`",
      "🎮 Upgraded fun commands UX (`/8ball`, `/compliment`, `/gaymeter`, `/ppmeter`, `/rps`, `/meme`)",
      "🛡️ Improved success embeds for all moderation commands (lock, unlock, clear, warn, roles, bans, kicks)",
      "📋 Added structured moderation feedback (member, moderator, reason, duration where applicable)",
      "🧾 Fixed duplicate logging issues between General Logs and Moderation Logs",
      "🚫 `/kick` and `/ban` no longer trigger General Logs — moderation logs only",
      "🧠 Improved event suppression logic to prevent unwanted log spam",
      "⚙️ Restored `/settings view` dashboard-style embed with clear system status indicators",
      "🔐 Improved permission checks and error handling for moderation actions",
      "🧹 Removed redundant moderation commands in favor of Discord-native timeout system",
      "🧠 Internal refactors for better stability, reliability, and maintainability"
    ],
  },

  {
    version: "1.9.2",
    date: "2026-01-14",
    changes: [
      "🐛 Fixed duplicate logs when using `/clear` (general + moderation logs firing together)",
      "🗑️ Fixed missing General Logs for messages deleted manually from Discord",
      "🧠 Improved suppression logic so moderation commands don’t trigger General Logs",
      "🕵️ Improved audit log detection for identifying who deleted a message",
      "📄 Corrected routing between General Logs and Moderation Logs",
      "🔒 Made message logging fully privacy-aware (respects privacy mode reliably)",
      "⚠️ Fixed interaction lifecycle errors (Unknown interaction / InteractionNotReplied)",
      "🛠️ Improved stability of `/settings` commands (no more silent failures)",
      "✨ Added UX improvements to `/settings view` with clearer status feedback"
    ],
  },

  {
    version: "1.9.1",
    date: "2026-01-13",
    changes: [
      "🧾 Introduced full case-based moderation system",
      "📂 Added /case view, edit, and delete commands",
      "🛡 Added /modlog recent and paginated /modlog user",
      "⚠️ Upgraded warning system with add, count, remove, and clear",
      "🔗 Added case jump references across logs",
      "🧹 Improved /clear logging behavior for single vs bulk deletes",
      "📜 Message delete logs now respect privacy settings",
      "📊 Action-based colors and cleaner moderation embeds",
      "⚙️ Added /setup command for first-time server configuration",
      "🧾 Added /changelog and /changelog latest commands",
      "🔁 Synced bot version automatically with /botinfo",
      "🧠 Improved audit log safety and permission fallbacks",
      "🧱 Internal refactors for stability and scalability"
    ],
  },

  {
    version: "1.9.0",
    date: "2025-12-28",
    changes: [
      "Initial public release of Ryvex",
      "Core moderation commands implemented",
      "Basic logging system added",
      "Welcome system with auto-role support",
      "MongoDB-backed server settings system"
    ],
  },
];
