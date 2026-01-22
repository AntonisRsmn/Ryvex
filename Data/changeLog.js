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
    version: "1.9.4",
    date: "2026-01-22",
    changes: [
      "🛡️ Introduced full AutoMod system (spam, links, bad words)",
      "⚙️ Added AutoMod presets (Soft / Medium / Strict)",
      "🎛️ Added `/automod filters` subcommand to individually toggle spam, link, and bad-word protection",
      "📍 Channel-based AutoMod bypass rules",
      "🧩 Role-based AutoMod bypass system",
      "⚖️ Configurable punishment system with warn-only & timed timeouts",
      "🤬 Custom bad-words management with enable/disable",
      "📊 Unified `/automod status` dashboard with full system visibility",
      "🧭 Integrated AutoMod overview into `/setup` guided configuration",
      "✨ Improved setup UX to ensure servers are correctly configured",
      "🧠 Stability and performance improvements across AutoMod checks"
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
