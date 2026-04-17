const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("View server configuration overview.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(cmd =>
      cmd.setName("view").setDescription("View current guild configuration")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const guild = interaction.guild;
      const settings = await getGuildSettings(guild.id);

      /* ───────── HELPERS ───────── */
      const yn = v => (v ? "✅" : "❌");
      const onOff = v => (v ? "🟢 ON" : "🔴 OFF");
      const ch = id => (id ? `<#${id}>` : "Not set");
      const rl = id => (id ? `<@&${id}>` : "Not set");

      /* ───────── LOGGING ───────── */
      const loggingEnabled = settings.logging?.enabled === true;
      const loggingChannelId = settings.logging?.channelId;
      const loggingReady = loggingEnabled && Boolean(loggingChannelId);
      const privacyMode = settings.logging?.messageContent === true ? "OFF" : "ON";

      /* ───────── MODERATION ───────── */
      const moderationEnabled = settings.moderation?.enabled === true;
      const moderationChannelId = settings.moderation?.channelId;
      const moderationReady = moderationEnabled && Boolean(moderationChannelId);

      /* ───────── WELCOME ───────── */
      const welcomeEnabled = settings.welcome?.enabled === true;
      const welcomeChannelId = settings.welcome?.channelId;
      const autoRoleId = settings.welcome?.autoRoleId;

      /* ───────── RULES ───────── */
      const rulesCount = Array.isArray(settings.rules) ? settings.rules.length : 0;

      /* ───────── AUTOMOD ───────── */
      const automod = settings.automod ?? {};
      const automodEnabled = automod.enabled === true;
      const spamOn = automod.spam === true;
      const linksOn = automod.links === true;
      const badWordsOn = automod.badWords === true;
      const activeFilters = [spamOn, linksOn, badWordsOn].filter(Boolean).length;
      const automodReady = automodEnabled && activeFilters > 0;
      const punishments = automod.punishments ?? {};
      const customWords = automod.badWordsCustom?.words?.length ?? 0;
      const ignoredChannels = automod.channels?.ignored?.length ?? 0;

      /* ───────── APPEALS ───────── */
      const appeals = settings.appeals ?? {};
      const appealsEnabled = appeals.enabled === true;
      const appealsChannelId = appeals.channelId;
      const appealsCooldown = appeals.cooldownMs
        ? Math.round(appeals.cooldownMs / (60 * 60 * 1000))
        : 12;

      /* ───────── STAFF MONITORING ───────── */
      const staffMonitoringEnabled = settings.staffMonitoring?.enabled === true;
      const staffAlerts = settings.staffMonitoring?.alerts?.length ?? 0;

      /* ───────── LEVELING / XP ───────── */
      const leveling = settings.leveling ?? {};
      const levelingEnabled = leveling.enabled === true;
      const levelingChannelId = leveling.channelId;
      const roleRewards = leveling.roleRewards?.length ?? 0;
      const xpMin = leveling.xpMin ?? 15;
      const xpMax = leveling.xpMax ?? 25;
      const xpCooldown = Math.round((leveling.cooldown ?? 60000) / 1000);
      const ignoredXpChannels = leveling.ignoredChannels?.length ?? 0;
      const ignoredXpRoles = leveling.ignoredRoles?.length ?? 0;

      /* ───────── ANTI-RAID ───────── */
      const antiRaid = settings.antiRaid ?? {};
      const antiRaidEnabled = antiRaid.enabled === true;
      const actionLabels = { lock: "🔒 Lock server", kick: "👢 Kick joiners", alert: "📢 Alert only" };

      /* ───────── SYSTEMS ARRAY ───────── */
      const systems = [
        { name: "Logging", ready: loggingReady },
        { name: "Moderation", ready: moderationReady },
        { name: "Welcome", ready: welcomeEnabled },
        { name: "AutoMod", ready: automodReady },
        { name: "Appeals", ready: appealsEnabled },
        { name: "Staff Monitoring", ready: staffMonitoringEnabled },
        { name: "Leveling", ready: levelingEnabled },
        { name: "Anti-Raid", ready: antiRaidEnabled },
      ];

      const enabledCount = systems.filter(s => s.ready).length;
      const total = systems.length;
      const barLength = 10;
      const filled = Math.round((enabledCount / total) * barLength);
      const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

      let color = "Red";
      if (enabledCount === total) color = "Green";
      else if (enabledCount > 0) color = "Orange";

      /* ═══════════════════════════════════════
         PAGES
         ═══════════════════════════════════════ */
      const pages = [

        /* ───── PAGE 1: OVERVIEW DASHBOARD ───── */
        new EmbedBuilder()
          .setTitle("⚙️ Server Configuration — Dashboard")
          .setColor(color)
          .setDescription(
            [
              `\`${bar}\` **${enabledCount}/${total}** systems active`,
              "",
              ...systems.map(s =>
                s.ready ? `> ✅ ${s.name}` : `> ❌ ${s.name}`
              ),
              "",
              "Use ◀ ▶ to browse detailed settings for each system.",
              "Run `/setup` for the full guide on how everything works.",
            ].join("\n")
          ),

        /* ───── PAGE 2: LOGGING ───── */
        new EmbedBuilder()
          .setTitle("📜 Logging")
          .setColor(loggingReady ? "Green" : "Red")
          .setDescription(
            [
              `**Status:** ${onOff(loggingEnabled)}`,
              `**Log channel:** ${ch(loggingChannelId)}`,
              `**Privacy mode:** ${privacyMode === "ON" ? "🔒 ON — message content hidden from logs" : "🔓 OFF — deleted/edited message content is visible"}`,
              "",
              "**What's being logged:**",
              `> Message edits & deletes ${yn(loggingEnabled)}`,
              `> Member joins & leaves ${yn(loggingEnabled)}`,
              `> Channel changes ${yn(loggingEnabled)}`,
              `> Role changes ${yn(loggingEnabled)}`,
              `> Server updates ${yn(loggingEnabled)}`,
              `> Bulk deletions ${yn(loggingEnabled)}`,
              "",
              loggingReady
                ? "✅ Logging is fully operational."
                : !loggingEnabled
                  ? "❌ **Logging is disabled.** Run `/logging enable` to turn it on."
                  : "⚠️ **No log channel set.** Run `/logging channel #channel`.",
              "",
              "**Quick config:**",
              "`/logging enable` · `/logging disable`",
              "`/logging channel #channel`",
            ].join("\n")
          ),

        /* ───── PAGE 3: MODERATION ───── */
        new EmbedBuilder()
          .setTitle("🛡 Moderation")
          .setColor(moderationReady ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(moderationEnabled)}`,
              `**Log channel:** ${ch(moderationChannelId)}`,
              "",
              "**Moderation actions available:**",
              "> `/ban` `/unban` `/kick` `/timeout` `/untimeout`",
              "> `/warn` `/clear` `/lock` `/unlock` `/slowmode`",
              "> `/add-role` `/remove-role`",
              "",
              "**Case system:** Every punishment creates a numbered case stored permanently in the database.",
              "",
              "**Audit commands:**",
              "> `/case view/edit/delete` — manage individual cases",
              "> `/history-user @member` — all actions against a member",
              "> `/history-staff @mod` — all actions by a staff member",
              "",
              moderationReady
                ? "✅ Moderation logs are active."
                : "⚠️ **Set a log channel** so staff actions are recorded.",
              "",
              "**Quick config:**",
              "`/moderation channel #channel`",
            ].join("\n")
          ),

        /* ───── PAGE 4: WELCOME ───── */
        new EmbedBuilder()
          .setTitle("👋 Welcome System")
          .setColor(welcomeEnabled ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(welcomeEnabled)}`,
              `**Channel:** ${ch(welcomeChannelId)}`,
              `**Auto-role:** ${rl(autoRoleId)}`,
              "",
              "**How it works:**",
              "> When a member joins, a welcome embed is sent to your channel.",
              "> If an auto-role is set, it's assigned instantly on join.",
              "",
              welcomeEnabled
                ? "✅ Welcome system is active."
                : "⚠️ **Disabled** — new members won't see a greeting.",
              "",
              "**Quick config:**",
              "`/welcome enable` · `/welcome disable`",
              "`/welcome channel #channel`",
              "`/welcome autorole @role`",
            ].join("\n")
          ),

        /* ───── PAGE 5: AUTOMOD ───── */
        new EmbedBuilder()
          .setTitle("🤖 AutoMod")
          .setColor(automodReady ? "Green" : automodEnabled ? "Orange" : "Red")
          .setDescription(
            [
              `**Status:** ${onOff(automodEnabled)}`,
              `**Active filters:** ${activeFilters}/3`,
              "",
              "**Filters:**",
              `> 🚫 Spam: ${onOff(spamOn)}`,
              `> 🔗 Links: ${onOff(linksOn)}`,
              `> 🤬 Bad words: ${onOff(badWordsOn)}`,
              "",
              "**Punishments:**",
              `> Enabled: ${yn(punishments.enabled)}`,
              `> Warn-only mode: ${yn(punishments.warnOnly)}`,
              `> Timeout after: **${punishments.timeoutAfter ?? 3}** warnings`,
              "",
              "**Extras:**",
              `> Custom bad words: **${customWords}** words`,
              `> Ignored channels: **${ignoredChannels}**`,
              "",
              automodReady
                ? "✅ AutoMod is actively protecting the server."
                : automodEnabled
                  ? "⚠️ **Enabled but no filters active.** Run `/automod preset medium`."
                  : "❌ **Disabled.** Run `/automod enable` to turn it on.",
              "",
              "**Quick config:**",
              "`/automod enable` · `/automod preset medium`",
              "`/automod filters` · `/automod-channel`",
              "`/automod-badwords` · `/automod-punishment`",
              "`/automod-roles` — bypass roles",
            ].join("\n")
          ),

        /* ───── PAGE 6: APPEALS ───── */
        new EmbedBuilder()
          .setTitle("📨 Appeals")
          .setColor(appealsEnabled ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(appealsEnabled)}`,
              `**Channel:** ${ch(appealsChannelId) === "Not set" ? "Auto-created on first appeal" : ch(appealsChannelId)}`,
              `**Cooldown:** ${appealsCooldown} hour(s) between appeals`,
              "",
              "**How it works:**",
              "> 1. Member runs `/appeal` and explains their case",
              "> 2. A private appeal appears in the appeals channel",
              "> 3. Staff review and accept or deny",
              "> 4. The member is notified of the outcome",
              "",
              appealsEnabled
                ? "✅ Appeals are open to members."
                : "⚠️ **Disabled** — members can't contest punishments.",
              "",
              "**Quick config:**",
              "`/appeal-admin config`",
              "`/appeal-admin close` · `/appeal-admin reopen`",
            ].join("\n")
          ),

        /* ───── PAGE 7: STAFF MONITORING ───── */
        new EmbedBuilder()
          .setTitle("🧑‍⚖️ Staff Monitoring")
          .setColor(staffMonitoringEnabled ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(staffMonitoringEnabled)}`,
              `**Alerts on record:** ${staffAlerts}`,
              "",
              "**What it tracks:**",
              "> Unusual punishment patterns from moderators",
              "> Rapid-fire bans or kicks in a short time",
              "> Actions that may indicate abuse of power",
              "",
              "**Staff dashboard:**",
              "> Shows all staff activity, total actions per mod, and flagged alerts.",
              "",
              staffMonitoringEnabled
                ? "✅ Monitoring is active — unusual staff behavior will be flagged."
                : "⚠️ **Disabled** — staff actions aren't being monitored for anomalies.",
              "",
              "**Quick config:**",
              "`/staff-flags enable` · `/staff-flags disable`",
              "`/staff-flags check` — view alerts",
              "`/staff dashboard` — full staff overview",
              "`/history-staff @mod` — individual mod history",
            ].join("\n")
          ),

        /* ───── PAGE 8: LEVELING / XP ───── */
        new EmbedBuilder()
          .setTitle("📊 Leveling / XP")
          .setColor(levelingEnabled ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(levelingEnabled)}`,
              `**Level-up channel:** ${ch(levelingChannelId) === "Not set" ? "Same channel (default)" : ch(levelingChannelId)}`,
              "",
              "**XP Settings:**",
              `> XP per message: **${xpMin}–${xpMax}**`,
              `> Cooldown: **${xpCooldown}s** between gains`,
              `> Role rewards: **${roleRewards}** configured`,
              `> Ignored channels: **${ignoredXpChannels}**`,
              `> Ignored roles: **${ignoredXpRoles}**`,
              "",
              levelingEnabled
                ? "✅ Members are earning XP."
                : "⚠️ **Disabled** — no XP is being tracked.",
              "",
              "**Quick config:**",
              "`/xp enable` · `/xp disable`",
              "`/xp channel #channel` — level-up announcements",
              "`/xp amount <min> <max>` · `/xp cooldown <sec>`",
              "`/xp rolereward <level> @role`",
              "`/xp settings` — view full XP config",
            ].join("\n")
          ),

        /* ───── PAGE 9: ANTI-RAID ───── */
        new EmbedBuilder()
          .setTitle("🛡️ Anti-Raid")
          .setColor(antiRaidEnabled ? "Green" : "Orange")
          .setDescription(
            [
              `**Status:** ${onOff(antiRaidEnabled)}`,
              `**Threshold:** ${antiRaid.threshold ?? 10} joins`,
              `**Window:** ${antiRaid.window ?? 30}s`,
              `**Action:** ${actionLabels[antiRaid.action ?? "lock"] ?? antiRaid.action ?? "lock"}`,
              `**Alert channel:** ${ch(antiRaid.alertChannelId) === "Not set" ? "Logging channel (fallback)" : ch(antiRaid.alertChannelId)}`,
              "",
              "**How it triggers:**",
              `> If **${antiRaid.threshold ?? 10}+** members join within **${antiRaid.window ?? 30}s**, the configured action fires automatically. A 5-minute cooldown prevents repeated triggers.`,
              "",
              "**Actions:**",
              "> 🔒 **Lock** — highest verification level (manual revert needed)",
              "> 👢 **Kick** — auto-kicks joiners during active raid",
              "> 📢 **Alert** — notifies staff, no automatic action",
              "",
              antiRaidEnabled
                ? "✅ Anti-raid is watching for mass joins."
                : "⚠️ **Disabled** — the server has no raid protection.",
              "",
              "**Quick config:**",
              "`/antiraid enable` · `/antiraid disable`",
              "`/antiraid threshold <count>` · `/antiraid window <sec>`",
              "`/antiraid action <lock/kick/alert>`",
              "`/antiraid channel #channel`",
              "`/antiraid settings`",
            ].join("\n")
          ),

        /* ───── PAGE 10: RULES & EXTRAS ───── */
        new EmbedBuilder()
          .setTitle("📜 Rules & Extras")
          .setColor("Blue")
          .setDescription(
            [
              "**Server Rules**",
              `> Rules configured: **${rulesCount}**`,
              `> ${rulesCount > 0 ? "✅ Rules are set and viewable via `/rules`." : "⚠️ No rules added yet."}`,
              "",
              "`/rules-admin add` · `/rules-admin edit` · `/rules-admin remove`",
              "",
              "───────────────────────────",
              "",
              "**Reaction Roles**",
              "> Self-assign role panels — members click to toggle roles.",
              "`/reactionrole create` · `/reactionrole add` · `/reactionrole remove`",
              "",
              "───────────────────────────",
              "",
              "**AFK System**",
              "> Members set AFK status; anyone who pings them gets notified.",
              "`/afk <reason>` — auto-removed when they talk again.",
              "",
              "───────────────────────────",
              "",
              "**Polls**",
              "`/poll` — create a poll in any channel.",
              "",
              "───────────────────────────",
              "",
              "**Need the full guide?** Run `/setup` for detailed explanations of every system.",
            ].join("\n")
          ),
      ];

      /* ═══════════════════════════════════════
         NAVIGATION
         ═══════════════════════════════════════ */
      let page = 0;

      const buildRow = () =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("settings_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("settings_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === pages.length - 1),
          new ButtonBuilder()
            .setCustomId("settings_close")
            .setLabel("✖ Close")
            .setStyle(ButtonStyle.Danger)
        );

      const applyFooter = () =>
        pages[page].setFooter({
          text: `Ryvex • Settings • Page ${page + 1}/${pages.length}`,
        }).setTimestamp();

      applyFooter();

      const msg = await interaction.editReply({
        embeds: [pages[page]],
        components: [buildRow()],
      });

      const collector = msg.createMessageComponentCollector({
        time: 180_000,
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "❌ This settings menu isn't for you.",
            ephemeral: true,
          });
        }

        await i.deferUpdate().catch(() => {});

        if (i.customId === "settings_close") return collector.stop();
        if (i.customId === "settings_prev" && page > 0) page--;
        if (i.customId === "settings_next" && page < pages.length - 1) page++;

        applyFooter();
        await interaction.editReply({
          embeds: [pages[page]],
          components: [buildRow()],
        });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          ...buildRow().components.map(b => b.setDisabled(true))
        );
        await interaction.editReply({ components: [disabledRow] }).catch(() => {});
      });
    } catch (err) {
      console.error("Settings command failed:", err);
      return respond(interaction, {
        content: "❌ Failed to retrieve server settings.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
