// Utils/changelogData.js

module.exports = [
  {
    version: "1.9.0",
    date: "2026-01-10",
    sections: {
      new: [
        "Case management system (/case view, edit, delete)",
        "Moderation history & logs (/modlog recent, /modlog user)",
        "Upgraded warning system (/warn add, count, remove, clear)"
      ],
      improvements: [
        "Cleaner moderation log embeds",
        "Action-based log colors",
        "Pagination for moderation history",
        "Safer audit-log handling"
      ],
      notes: [
        "Run /setup to review new configuration options"
      ]
    }
  }
];
