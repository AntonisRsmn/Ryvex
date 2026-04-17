const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antiraid")
    .setDescription("Configure anti-raid protection.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    /* ── enable ── */
    .addSubcommand(sub =>
      sub
        .setName("enable")
        .setDescription("Enable anti-raid protection.")
    )

    /* ── disable ── */
    .addSubcommand(sub =>
      sub
        .setName("disable")
        .setDescription("Disable anti-raid protection.")
    )

    /* ── threshold ── */
    .addSubcommand(sub =>
      sub
        .setName("threshold")
        .setDescription("Set how many joins trigger a raid alert.")
        .addIntegerOption(opt =>
          opt
            .setName("count")
            .setDescription("Number of joins to trigger (e.g. 10).")
            .setMinValue(3)
            .setMaxValue(50)
            .setRequired(true)
        )
    )

    /* ── window ── */
    .addSubcommand(sub =>
      sub
        .setName("window")
        .setDescription("Set the time window for counting joins.")
        .addIntegerOption(opt =>
          opt
            .setName("seconds")
            .setDescription("Time window in seconds (e.g. 30).")
            .setMinValue(5)
            .setMaxValue(120)
            .setRequired(true)
        )
    )

    /* ── action ── */
    .addSubcommand(sub =>
      sub
        .setName("action")
        .setDescription("Set what happens when a raid is detected.")
        .addStringOption(opt =>
          opt
            .setName("type")
            .setDescription("Action to take.")
            .setRequired(true)
            .addChoices(
              { name: "Lock (set verification to highest)", value: "lock" },
              { name: "Kick (kick new joiners)", value: "kick" },
              { name: "Alert only (notify staff)", value: "alert" }
            )
        )
    )

    /* ── channel ── */
    .addSubcommand(sub =>
      sub
        .setName("channel")
        .setDescription("Set the alert channel for raid notifications.")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Channel to send raid alerts to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    /* ── settings ── */
    .addSubcommand(sub =>
      sub
        .setName("settings")
        .setDescription("View current anti-raid settings.")
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      const { guild, options } = interaction;
      const sub = options.getSubcommand();
      const settings = await getGuildSettings(guild.id);
      if (!settings) {
        return respond(interaction, {
          content: "❌ Failed to load settings. Please try again.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const antiRaid = settings.antiRaid ?? {};

      /* ═══════ ENABLE ═══════ */
      if (sub === "enable") {
        await updateGuildSettings(guild.id, { "antiRaid.enabled": true });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("✅ Anti-raid protection has been **enabled**.")
              .setColor("Green"),
          ],
        });
      }

      /* ═══════ DISABLE ═══════ */
      if (sub === "disable") {
        await updateGuildSettings(guild.id, { "antiRaid.enabled": false });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Anti-raid protection has been **disabled**.")
              .setColor("Red"),
          ],
        });
      }

      /* ═══════ THRESHOLD ═══════ */
      if (sub === "threshold") {
        const count = options.getInteger("count");
        await updateGuildSettings(guild.id, { "antiRaid.threshold": count });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`✅ Raid threshold set to **${count} joins**.`)
              .setColor("Green"),
          ],
        });
      }

      /* ═══════ WINDOW ═══════ */
      if (sub === "window") {
        const seconds = options.getInteger("seconds");
        await updateGuildSettings(guild.id, { "antiRaid.window": seconds });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`✅ Time window set to **${seconds} seconds**.`)
              .setColor("Green"),
          ],
        });
      }

      /* ═══════ ACTION ═══════ */
      if (sub === "action") {
        const type = options.getString("type");
        await updateGuildSettings(guild.id, { "antiRaid.action": type });

        const labels = { lock: "Lock (highest verification)", kick: "Kick new joiners", alert: "Alert only" };

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`✅ Raid action set to **${labels[type]}**.`)
              .setColor("Green"),
          ],
        });
      }

      /* ═══════ CHANNEL ═══════ */
      if (sub === "channel") {
        const channel = options.getChannel("channel");
        await updateGuildSettings(guild.id, { "antiRaid.alertChannelId": channel.id });

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`✅ Raid alerts will be sent to ${channel}.`)
              .setColor("Green"),
          ],
        });
      }

      /* ═══════ SETTINGS ═══════ */
      if (sub === "settings") {
        const enabled = antiRaid.enabled ? "🟢 ON" : "🔴 OFF";
        const threshold = antiRaid.threshold ?? 10;
        const window = antiRaid.window ?? 30;
        const action = antiRaid.action ?? "lock";
        const alertCh = antiRaid.alertChannelId
          ? `<#${antiRaid.alertChannelId}>`
          : "Logging channel (fallback)";

        const actionLabels = { lock: "🔒 Lock server", kick: "👢 Kick joiners", alert: "📢 Alert only" };

        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setTitle("🛡️ Anti-Raid Settings")
              .setColor("White")
              .addFields(
                { name: "Status", value: enabled, inline: true },
                { name: "Threshold", value: `${threshold} joins`, inline: true },
                { name: "Window", value: `${window}s`, inline: true },
                { name: "Action", value: actionLabels[action] ?? action, inline: true },
                { name: "Alert Channel", value: alertCh, inline: true }
              ),
          ],
        });
      }
    } catch (error) {
      console.error("Anti-raid command failed:", error);
      return respond(interaction, {
        content: "❌ Something went wrong.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
