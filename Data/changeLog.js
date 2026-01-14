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
    version: "1.9.1",
    date: "2026-01-14",
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
