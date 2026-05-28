const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { respond } = require("../../Utils/respond");

/* ───────── UTIL ───────── */
function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Configure the AutoMod system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(s =>
      s.setName("enable").setDescription("Enable AutoMod")
    )
    .addSubcommand(s =>
      s.setName("disable").setDescription("Disable AutoMod")
    )
    .addSubcommand(s =>
      s.setName("status").setDescription("View AutoMod status")
    )
    .addSubcommand(s =>
      s
        .setName("preset")
        .setDescription("Apply an AutoMod preset")
        .addStringOption(o =>
          o
            .setName("type")
            .setDescription("Preset strictness")
            .setRequired(true)
            .addChoices(
              { name: "Soft", value: "soft" },
              { name: "Medium", value: "medium" },
              { name: "Strict", value: "strict" }
            )
        )
    )
    .addSubcommand(s =>
      s
        .setName("filters")
        .setDescription("Enable or disable AutoMod filters")
        .addStringOption(o =>
          o.setName("spam")
            .setDescription("Spam filter")
            .addChoices(
              { name: "On", value: "on" },
              { name: "Off", value: "off" }
            )
        )
        .addStringOption(o =>
          o.setName("links")
            .setDescription("Link filter")
            .addChoices(
              { name: "On", value: "on" },
              { name: "Off", value: "off" }
            )
        )
        .addStringOption(o =>
          o.setName("badwords")
            .setDescription("Bad-word filter")
            .addChoices(
              { name: "On", value: "on" },
              { name: "Off", value: "off" }
            )
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const settings = await getGuildSettings(guildId);
    const a = settings.automod;

    /* ───────── ENABLE ───────── */
    if (sub === "enable") {
    const alreadyConfigured =
      settings.automod.spam ||
      settings.automod.links ||
      settings.automod.badWords;

    if (!alreadyConfigured) {
      await updateGuildSettings(guildId, {
        automod: {
          enabled: true,
          spam: true,
          links: true,
          badWords: true,
          punishments: {
            enabled: true,
            warnOnly: false,
            timeoutAfter: 3,
            durations: new Map([
              ["3", 24 * 60 * 60 * 1000], // 24h
            ]),
          },
        },
      });

      return respond(interaction, {
        content: "🛡 AutoMod enabled using **MEDIUM preset** (default).",
      });
    }

    await updateGuildSettings(guildId, { "automod.enabled": true });
    return respond(interaction, { content: "🛡 AutoMod enabled." });
  }

    /* ───────── DISABLE ───────── */
    if (sub === "disable") {
      await updateGuildSettings(guildId, { "automod.enabled": false });
      return respond(interaction, { content: "🛑 AutoMod **disabled**." });
    }

    /* ───────── PRESET ───────── */
    if (sub === "preset") {
      const type = interaction.options.getString("type");

      const presets = {
        soft: {
          enabled: true,
          spam: true,
          links: false,
          badWords: true,
          punishments: {
            enabled: true,
            warnOnly: true,
            timeoutAfter: 5,
            durations: new Map(),
          },
        },
        medium: {
        enabled: true,
        spam: true,
        links: true,
        badWords: true,
        punishments: {
          enabled: true,
          warnOnly: false,
          timeoutAfter: 2,
          durations: new Map([
            ["2", 10 * 60 * 1000],        // 10 minutes
            ["3", 60 * 60 * 1000],        // 1 hour
            ["4", 24 * 60 * 60 * 1000],   // 24 hours (sticky max)
          ]),
        },
      },
        strict: {
          enabled: true,
          spam: true,
          links: true,
          badWords: true,
          punishments: {
            enabled: true,
            warnOnly: false,
            timeoutAfter: 1,
            durations: new Map([
              ["1", 10 * 60 * 1000],        // 10 minutes
              ["2", 60 * 60 * 1000],        // 1 hour
              ["3", 24 * 60 * 60 * 1000],   // 24 hours (sticky max)
            ]),
          },
        },
      };

      await updateGuildSettings(guildId, {
        automod: { ...a, ...presets[type] },
      });

      return respond(interaction, {
        content: `✅ **${type.toUpperCase()}** preset applied.`,
      });
    }

    /* ───────── PRESET ───────── */

    if (sub === "filters") {
      const spam = interaction.options.getString("spam");
      const links = interaction.options.getString("links");
      const badWords = interaction.options.getString("badwords");

      const updates = {};
      if (spam !== null) updates["automod.spam"] = spam === "on";
      if (links !== null) updates["automod.links"] = links === "on";
      if (badWords !== null) updates["automod.badWords"] = badWords === "on";

      if (!Object.keys(updates).length) {
        return respond(interaction, {
          content: "❌ You must change at least one filter.",
        });
      }

      await updateGuildSettings(guildId, updates);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🧰 AutoMod Filters Updated")
            .setDescription(
              [
                spam && `🚫 Spam: ${spam.toUpperCase()}`,
                links && `🔗 Links: ${links.toUpperCase()}`,
                badWords && `🤬 Bad Words: ${badWords.toUpperCase()}`,
              ].filter(Boolean).join("\n")
            )
            .setColor("Blue")
            .setFooter({ text: "Ryvex • AutoMod" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── STATUS (FULL OVERVIEW) ───────── */
    if (sub === "status") {
      const ch = a.channels ?? {};
      const p = a.punishments ?? {};
      const bw = a.badWordsCustom ?? {};

      const durations =
        p.durations instanceof Map
          ? [...p.durations.entries()]
          : Object.entries(p.durations ?? {});

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🛡 AutoMod Configuration Overview")
            .setColor(a.enabled ? "Green" : "Red")
            /* CORE */
            .addFields({
              name: "⚙ Core",
              value: [
                `Enabled: ${a.enabled ? "✅" : "❌"}`,
                `Warn Only: ${p.warnOnly ? "✅" : "❌"}`,
                `Timeout After: ${p.timeoutAfter ?? "—"} warns`,
              ].join("\n"),
            })
            /* FILTERS */
            .addFields({
              name: "🧰 Filters",
              value: [
                `🚫 Spam: ${a.spam ? "ON" : "OFF"}`,
                `🔗 Links: ${a.links ? "ON" : "OFF"}`,
                `🤬 Bad Words: ${a.badWords ? "ON" : "OFF"}`,
              ].join("\n"),
              inline: true,
            })

            /* CHANNEL RULES */
            .addFields({
              name: "📍 Channel Rules",
              value: [
                `Ignored: ${ch.ignored?.length ?? 0}`,
                `Spam Disabled: ${ch.spamDisabled?.length ?? 0}`,
                `Links Allowed: ${ch.linksAllowed?.length ?? 0}`,
                `BadWords Disabled: ${ch.badWordsDisabled?.length ?? 0}`,
              ].join("\n"),
              inline: true,
            })
            /* BAD WORDS */
            .addFields({
              name: "🤬 Custom Bad Words",
              value: bw.words?.join(", ") || "None",
            })
            /* PUNISHMENTS */
            .addFields({
              name: "🛠 Punishments",
              value: [
                `Warn: ${p.warn ?? "—"}`,
                `Timeout: ${p.timeout ?? "—"}`,
                `Kick: ${p.kick ?? "—"}`,
                `Ban: ${p.ban ?? "—"}`,
                `Durations: ${durations.map(([k, v]) => `${k}: ${v}`).join(", ") || "—"}`,
              ].join("\n"),
            })
            .setFooter({ text: "Ryvex • AutoMod" })
            .setTimestamp(),
        ],
      });
    }
  },
};
