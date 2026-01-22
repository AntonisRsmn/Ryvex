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

function toMs(value, unit) {
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  if (unit === "d") return value * 24 * 60 * 60 * 1000;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod-punishment")
    .setDescription("Configure AutoMod punishments")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(s =>
      s.setName("enable").setDescription("Enable AutoMod punishments")
    )
    .addSubcommand(s =>
      s.setName("disable").setDescription("Disable AutoMod punishments")
    )
    .addSubcommand(s =>
      s.setName("warnonly").setDescription("Toggle warn-only mode")
    )
    .addSubcommand(s =>
      s
        .setName("timeout")
        .setDescription("Set timeout duration for a warn level")
        .addIntegerOption(o =>
          o
            .setName("warns")
            .setDescription("Number of warnings required")
            .setRequired(true)
        )
        .addIntegerOption(o =>
          o
            .setName("value")
            .setDescription("Duration value")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("unit")
            .setDescription("Time unit")
            .setRequired(true)
            .addChoices(
              { name: "Minutes", value: "m" },
              { name: "Hours", value: "h" },
              { name: "Days", value: "d" }
            )
        )
    )
    .addSubcommand(s =>
      s.setName("view").setDescription("View punishment configuration")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const settings = await getGuildSettings(guildId);
    const p = settings.automod.punishments;

    if (sub === "enable") p.enabled = true;
    if (sub === "disable") p.enabled = false;
    if (sub === "warnonly") p.warnOnly = !p.warnOnly;

    if (sub === "timeout") {
      const warns = interaction.options.getInteger("warns");
      const value = interaction.options.getInteger("value");
      const unit = interaction.options.getString("unit");

      p.durations.set(String(warns), toMs(value, unit));
    }

    if (sub !== "view") {
      await updateGuildSettings(guildId, { "automod.punishments": p });
      return respond(interaction, { content: "⚖ Punishments updated." });
    }

    return respond(interaction, {
      embeds: [
        new EmbedBuilder()
          .setTitle("⚖ AutoMod Punishments")
          .setDescription(
            [
              `Enabled: ${p.enabled ? "✅" : "❌"}`,
              `Warn Only: ${p.warnOnly ? "Yes" : "No"}`,
              "",
              ...[...p.durations.entries()].map(
                ([w, ms]) => `• ${w} warns → ${ms / 60000} min`
              ),
            ].join("\n")
          )
          .setColor("Purple"),
      ],
    });
  },
};
