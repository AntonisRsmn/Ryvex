const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Complete setup & configuration guide for Ryvex")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const settings = await getGuildSettings(interaction.guild.id);

    /* ───────── HELPERS ───────── */
    const yesNo = v => (v ? "✅ Yes" : "❌ No");
    const onOff = v => (v ? "🟢 ON" : "🔴 OFF");
    const count = v => (Array.isArray(v) ? v.length : 0);

    /* ───────── LOGGING STATUS ───────── */
    const loggingEnabled = settings.logging?.enabled === true;
    const loggingChannel = settings.logging?.channelId;
    const loggingReady = loggingEnabled && Boolean(loggingChannel);

    /* ───────── MODERATION STATUS ───────── */
    const moderationEnabled = settings.moderation?.enabled === true;
    const moderationChannel = settings.moderation?.channelId;
    const moderationReady =
      moderationEnabled && Boolean(moderationChannel);

    /* ───────── WELCOME STATUS ───────── */
    const welcomeEnabled = settings.welcome?.enabled === true;
    const welcomeChannel = settings.welcome?.channelId;
    const autoRoleId = settings.welcome?.autoRoleId;

    /* ───────── RULES STATUS (NEW) ───────── */
    const rulesConfigured = Array.isArray(settings.rules) && settings.rules.length > 0;

    /* ───────── APPEALS STATUS ───────── */
    const appeals = settings.appeals ?? {};
    const appealsEnabled = appeals.enabled === true;
    const appealsChannel = appeals.channelId;
    const appealsCooldownHours = appeals.cooldownMs
      ? Math.round(appeals.cooldownMs / (60 * 60 * 1000))
      : "—";

    const appealsReady = appealsEnabled;

    /* ───────── AUTOMOD STATUS ───────── */
    const automod = settings.automod ?? {};
    const automodEnabled = automod.enabled === true;

    const filtersEnabled = {
      spam: automod.spam === true,
      links: automod.links === true,
      badWords: automod.badWords === true,
    };

    const activeFiltersCount =
      Object.values(filtersEnabled).filter(Boolean).length;

    const automodReady =
      automodEnabled && activeFiltersCount > 0;

    /* ───────── STAFF MONITORING STATUS ───────── */
    const staffMonitoringEnabled =
      settings.staffMonitoring?.enabled === true;

    const staffAlertsCount =
      settings.staffMonitoring?.alerts?.length ?? 0;

    /* ───────── LEVELING / XP STATUS ───────── */
    const leveling = settings.leveling ?? {};
    const levelingEnabled = leveling.enabled === true;
    const levelingChannel = leveling.channelId;
    const roleRewardsCount = leveling.roleRewards?.length ?? 0;
    const xpMin = leveling.xpMin ?? 15;
    const xpMax = leveling.xpMax ?? 25;
    const xpCooldown = Math.round((leveling.cooldown ?? 60000) / 1000);

    /* ───────── ANTI-RAID STATUS ───────── */
    const antiRaid = settings.antiRaid ?? {};
    const antiRaidEnabled = antiRaid.enabled === true;

    /* ───────── PAGES ───────── */
    const pages = [

      /* ═══════════════════════════════════════
         PAGE 1 — WELCOME & OVERVIEW
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🚀 Welcome to Ryvex")
        .setColor("Blue")
        .setDescription(
          [
            "Hey there 👋 — thanks for adding **Ryvex** to your server!",
            "",
            "This guide walks you and your staff through **every system** Ryvex offers — how it works behind the scenes, how to set it up, and what commands are available.",
            "",
            "📖 **What this guide covers:**",
            "> 📜 Logging — track everything that happens",
            "> 🛡 Moderation — punishments, cases & audit trails",
            "> 👋 Welcome — greet new members automatically",
            "> 📜 Rules — server rules members can view anytime",
            "> 📨 Appeals — let members contest punishments",
            "> 🤖 AutoMod — automatic rule enforcement",
            "> 🧑‍⚖️ Staff Monitoring — keep your team accountable",
            "> 📊 Leveling / XP — reward active members",
            "> 🛡️ Anti-Raid — mass-join detection",
            "> 🎮 Fun — games, memes & social commands",
            "> 📋 Final Checklist — see what's done & what's left",
            "",
            "**This guide is read-only.** Nothing is changed — just information.",
            "Use ◀ ▶ to navigate. Take your time.",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 2 — LOGGING (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("📜 Logging System")
        .setColor(loggingReady ? "Green" : "Red")
        .setDescription(
          [
            "**What is it?**",
            "The logging system is the backbone of Ryvex. It records everything that happens in your server into a dedicated log channel so staff can review activity at any time.",
            "",
            "**What gets logged?**",
            "• 💬 Message edits & deletions (with content if privacy mode is off)",
            "• 👋 Members joining & leaving",
            "• 📝 Channel created, updated & deleted",
            "• 🎭 Roles created, updated & deleted",
            "• ⚙️ Server setting changes",
            "• 📦 Bulk message deletions",
            "",
            "**How it works:**",
            "Ryvex listens to Discord events in real-time. When something happens, it creates a detailed embed with who did it, what changed, and when — then sends it to your log channel.",
            "",
            "**Privacy mode:** When ON (default), message content is **hidden** from edit/delete logs. Turn it off only if your staff needs to see deleted message content.",
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(loggingEnabled)}`,
            `> Channel: ${loggingChannel ? `<#${loggingChannel}>` : "❌ Not set"}`,
            `> Privacy mode: ${settings.logging?.messageContent ? "🔓 OFF (content visible)" : "🔒 ON (content hidden)"}`,
            "",
            loggingReady
              ? "✅ **Logging is fully configured and active.**"
              : "❌ **Logging is required for Ryvex to work properly. Set it up first!**",
            "",
            "**Commands:**",
            "`/logging enable` — Turn logging on",
            "`/logging disable` — Turn logging off",
            "`/logging channel #channel` — Set where logs are sent",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 3 — MODERATION SYSTEM (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🛡 Moderation System")
        .setColor(moderationReady ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "The full moderation toolkit. Every punishment creates a **numbered case** stored in the database with the moderator, target, reason, and timestamp.",
            "",
            "**Available punishments:**",
            "🔨 `/ban` — Permanently ban a member",
            "🔓 `/unban` — Unban by user ID",
            "👢 `/kick` — Kick a member",
            "⏱ `/timeout` — Mute for up to 27 days",
            "🔊 `/untimeout` — Remove a timeout early",
            "⚠️ `/warn` — Issue a formal warning (tracked as a case)",
            "🧹 `/clear` — Bulk-delete messages (optionally filter by user)",
            "🔒 `/lock` / `/unlock` — Prevent or restore sending in a channel",
            "⏱ `/slowmode` — Set message cooldown (0–6hrs)",
            "🎭 `/add-role` / `/remove-role` — Manage member roles",
            "",
            "**How cases work:**",
            "Every ban, kick, timeout, and warn generates a unique **case #**. Cases are permanent records stored in the database. Staff can view, edit, or delete cases.",
            "",
            "**Moderation log channel:**",
            "If configured, every action is also posted as a rich embed to your moderation channel — separate from general logging.",
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(moderationEnabled)}`,
            `> Log channel: ${moderationChannel ? `<#${moderationChannel}>` : "❌ Not set"}`,
            "",
            moderationReady
              ? "✅ **Moderation logging is configured.**"
              : "⚠️ **Set a moderation log channel so staff actions are recorded.**",
            "",
            "**Config commands:**",
            "`/moderation channel #channel` — Set the mod log channel",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 4 — AUDIT & CASE MANAGEMENT
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🔍 Audit & Case Management")
        .setColor("Purple")
        .setDescription(
          [
            "**What is it?**",
            "The audit system lets staff review moderation history, investigate members, and manage individual cases. Think of it as your server's internal records.",
            "",
            "**Investigating members:**",
            "`/history-user @member` — See everything that's been done **to** a member (bans, warns, timeouts, etc.)",
            "`/history` — Members can view their **own** history privately",
            "",
            "**Investigating staff:**",
            "`/history-staff @moderator` — See every action a staff member has taken",
            "`/staff dashboard` — Overview of all staff activity",
            "",
            "**Managing cases:**",
            "`/case view <number>` — View details of a specific case",
            "`/case edit <number>` — Edit the reason on a case",
            "`/case delete <number>` — Remove a case from the record",
            "",
            "**Managing warnings:**",
            "`/warn add @member <reason>` — Issue a warning",
            "`/warn remove @member <id>` — Remove a specific warning",
            "`/warn view @member` — List all warnings for a member",
            "",
            "**Why this matters:**",
            "Accountability goes both ways. Members can see why they were punished, and server owners can verify staff are acting appropriately. Every action leaves a trail.",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 5 — WELCOME SYSTEM (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("👋 Welcome System")
        .setColor(welcomeEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "Automatically greets new members when they join and can assign them a role instantly.",
            "",
            "**How it works:**",
            "When someone joins, Ryvex sends a welcome embed to your chosen channel with their name, avatar, and a greeting. If an auto-role is set, it's assigned immediately.",
            "",
            "**Auto-role explained:**",
            "The auto-role is given to **every** new member the moment they join. Use this for a \"Member\" role, a color role, or to grant access to basic channels. Only set one role — for more complex setups, use reaction roles.",
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(welcomeEnabled)}`,
            `> Channel: ${welcomeChannel ? `<#${welcomeChannel}>` : "❌ Not set"}`,
            `> Auto-role: ${autoRoleId ? `<@&${autoRoleId}>` : "Not set"}`,
            "",
            welcomeEnabled
              ? "✅ **Welcome system is active.**"
              : "⚠️ **Disabled — new members won't see a greeting.**",
            "",
            "**Commands:**",
            "`/welcome enable` — Turn on welcome messages",
            "`/welcome disable` — Turn off welcome messages",
            "`/welcome channel #channel` — Set the welcome channel",
            "`/welcome autorole @role` — Set the auto-assigned role",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 6 — SERVER RULES (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("📜 Server Rules")
        .setColor(rulesConfigured ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "A built-in rules system that stores your server rules in the database. Members can view them anytime with `/rules`, and staff can reference specific rules when punishing.",
            "",
            "**How it works:**",
            "Rules are numbered automatically. When a moderator bans or warns someone, they can cite a rule number. Members who appeal can see exactly which rule they broke.",
            "",
            "**Why use this instead of a rules channel?**",
            "• Rules are always one command away — no scrolling",
            "• Staff can reference rules by number in punishments",
            "• Rules integrate with the appeals system",
            "• Easy to add, edit, reorder, or remove without rewriting a whole message",
            "",
            "**Your current status:**",
            `> Rules configured: ${yesNo(rulesConfigured)}`,
            "",
            rulesConfigured
              ? "✅ **Rules are set and visible to members.**"
              : "⚠️ **No rules added yet. Members will see an empty list.**",
            "",
            "**Admin commands:**",
            "`/rules-admin add <text>` — Add a new rule",
            "`/rules-admin edit <number> <text>` — Edit a rule",
            "`/rules-admin remove <number>` — Delete a rule",
            "",
            "**Member commands:**",
            "`/rules` — View all server rules",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 7 — APPEALS SYSTEM (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("📨 Appeals System")
        .setColor(appealsReady ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "Lets punished members submit appeals that staff can review, approve, or deny. Appeals are private and cooldown-protected.",
            "",
            "**How it works:**",
            "1. A member runs `/appeal` and fills out a reason",
            "2. Ryvex creates a private appeal visible only to staff",
            "3. Staff review in the appeals channel and accept/deny",
            "4. The member is notified of the outcome",
            "",
            "**Cooldown:**",
            `Members can only submit one appeal every **${appealsCooldownHours} hour(s)** to prevent spam. Admins can adjust this.`,
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(appealsEnabled)}`,
            `> Channel: ${appealsChannel ? `<#${appealsChannel}>` : "Auto-created on first appeal"}`,
            `> Cooldown: ${appealsCooldownHours} hour(s)`,
            "",
            appealsReady
              ? "✅ **Appeals are open to members.**"
              : "⚠️ **Appeals are disabled — members can't contest punishments.**",
            "",
            "**Admin commands:**",
            "`/appeal-admin config` — Enable/disable & set cooldown",
            "`/appeal-admin close` — Close an appeal",
            "`/appeal-admin reopen` — Reopen a closed appeal",
            "",
            "**Member command:**",
            "`/appeal` — Submit an appeal",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 8 — AUTOMOD OVERVIEW (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🤖 AutoMod — How It Works")
        .setColor(automodReady ? "Green" : automodEnabled ? "Orange" : "Red")
        .setDescription(
          [
            "**What is it?**",
            "AutoMod automatically detects and punishes rule-breaking messages **without** needing a moderator online. It runs 24/7.",
            "",
            "**Three filters:**",
            `🚫 **Spam filter** ${onOff(filtersEnabled.spam)} — Detects repeated messages, mass pings, and flooding. Ryvex tracks messages per-user in memory and flags rapid posting.`,
            "",
            `🔗 **Link filter** ${onOff(filtersEnabled.links)} — Blocks URLs and invite links. Useful for preventing advertising and phishing.`,
            "",
            `🤬 **Bad words filter** ${onOff(filtersEnabled.badWords)} — Matches messages against a built-in word list + your custom words. Catches common evasion tricks.`,
            "",
            "**How punishments escalate:**",
            "1st–2nd offense → Warning (message deleted + DM)",
            `3rd offense → Timeout (${automod.punishments?.durations?.get?.("3") ? Math.round(automod.punishments.durations.get("3") / 60000) + "m" : "10m"})`,
            `4th offense → Longer timeout`,
            `5th+ offense → Even longer timeout`,
            "",
            "Punishments reset over time. Staff can toggle warn-only mode to disable timeouts entirely.",
            "",
            "**Your current status:**",
            `> AutoMod: ${yesNo(automodEnabled)}`,
            `> Active filters: **${activeFiltersCount}/3**`,
            "",
            "**Quick start:**",
            "`/automod enable` — Turn on AutoMod",
            "`/automod preset medium` — Enable all 3 filters at once",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 9 — AUTOMOD CONFIGURATION (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("⚙️ AutoMod — Advanced Configuration")
        .setColor("Purple")
        .setDescription(
          [
            "**Fine-tuning your setup:**",
            "",
            "**Channel bypasses:**",
            "You can exempt specific channels from each filter. For example, allow links in `#resources` but block them everywhere else.",
            `• Fully ignored channels: **${count(automod.channels?.ignored)}**`,
            `• Spam-disabled channels: **${count(automod.channels?.spamDisabled)}**`,
            `• Link-allowed channels: **${count(automod.channels?.linksAllowed)}**`,
            `• Bad-word-disabled channels: **${count(automod.channels?.badWordsDisabled)}**`,
            "",
            "**Role bypasses:**",
            "Staff and trusted roles can be exempted from all AutoMod checks. Use `/automod-roles` to manage this.",
            "",
            "**Custom bad words:**",
            `Enabled: ${yesNo(automod.badWordsCustom?.enabled)}`,
            "Add your own words/phrases on top of the built-in list. Ryvex will match them even if users try to evade with symbols.",
            "",
            "**Punishment settings:**",
            `• Punishments: ${yesNo(automod.punishments?.enabled)}`,
            `• Warn-only mode: ${yesNo(automod.punishments?.warnOnly)} ${automod.punishments?.warnOnly ? "(no timeouts)" : ""}`,
            `• Timeout starts after: **${automod.punishments?.timeoutAfter ?? 3}** warnings`,
            "",
            "**Commands:**",
            "`/automod filters` — Toggle individual filters",
            "`/automod-channel` — Set per-channel exemptions",
            "`/automod-roles add/remove @role` — Manage bypassed roles",
            "`/automod-badwords add/remove <word>` — Custom word list",
            "`/automod-punishment view` — See current escalation rules",
            "`/automod-punishment warnonly` — Toggle warn-only mode",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 10 — STAFF MONITORING (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🧑‍⚖️ Staff Monitoring")
        .setColor(staffMonitoringEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "A system that watches moderator behavior and flags unusual patterns. Designed for server owners who want accountability from their staff.",
            "",
            "**What it detects:**",
            "• Moderators issuing an unusual number of punishments",
            "• Rapid-fire bans or kicks in a short time",
            "• Actions that might indicate abuse of power",
            "",
            "**How it works:**",
            "Ryvex tracks every moderation action by staff member. When behavior exceeds normal thresholds, it creates an **alert** that the owner can review. Alerts are stored permanently.",
            "",
            "**Staff dashboard:**",
            "View a summary of all staff activity — who's been most active, total actions per moderator, and any flagged alerts.",
            "",
            "**Your current status:**",
            `> Enabled: ${yesNo(staffMonitoringEnabled)}`,
            `> Alerts on record: **${staffAlertsCount}**`,
            "",
            staffMonitoringEnabled
              ? "✅ **Staff monitoring is watching for unusual activity.**"
              : "⚠️ **Disabled — staff actions aren't being tracked for anomalies.**",
            "",
            "**Commands:**",
            "`/staff-flags enable` — Turn on monitoring",
            "`/staff-flags disable` — Turn off monitoring",
            "`/staff-flags check` — View current alerts",
            "`/staff dashboard` — Full staff activity overview",
            "`/history-staff @mod` — Detailed history for one moderator",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 11 — LEVELING / XP (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("📊 Leveling / XP System")
        .setColor(levelingEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "Members earn XP by sending messages. XP accumulates into levels, and you can reward milestones with automatic role assignments.",
            "",
            "**How XP works:**",
            `• Each message grants **${xpMin}–${xpMax} XP** (random within range)`,
            `• Cooldown between XP gains: **${xpCooldown}s** (prevents spam farming)`,
            "• XP is per-server — members start fresh in each server",
            "• Level thresholds increase with each level (it gets harder)",
            "",
            "**Role rewards:**",
            `Currently configured: **${roleRewardsCount}** role reward(s)`,
            "When a member reaches a specific level, they automatically receive a role. Great for VIP tiers, color roles, or channel access.",
            "",
            "**Level-up announcements:**",
            `Channel: ${levelingChannel ? `<#${levelingChannel}>` : "Same channel where they leveled up"}`,
            "Ryvex posts a congratulations embed when someone levels up.",
            "",
            "**Ignored channels/roles:**",
            "You can exclude bot-spam channels or specific roles from earning XP entirely.",
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(levelingEnabled)}`,
            "",
            "**Admin commands:**",
            "`/xp enable` / `/xp disable` — Toggle the system",
            "`/xp channel #channel` — Set level-up announcement channel",
            "`/xp amount <min> <max>` — Adjust XP per message",
            "`/xp cooldown <seconds>` — Adjust XP gain cooldown",
            "`/xp rolereward <level> @role` — Add role reward",
            "`/xp removerolereward <level>` — Remove role reward",
            "`/xp set @user <amount>` — Manually set XP",
            "`/xp reset @user` — Reset a member's XP to 0",
            "`/xp settings` — View full XP configuration",
            "",
            "**Member commands:**",
            "`/rank` — View your level & XP",
            "`/rank @user` — Check someone else's level",
            "`/leaderboard` — Server XP rankings",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 12 — ANTI-RAID (DETAILED)
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🛡️ Anti-Raid Protection")
        .setColor(antiRaidEnabled ? "Green" : "Orange")
        .setDescription(
          [
            "**What is it?**",
            "Detects when many accounts join your server in rapid succession (a raid) and takes automatic action to protect it.",
            "",
            "**How it works:**",
            `Ryvex tracks join timestamps in memory. If **${antiRaid.threshold ?? 10}+ members** join within **${antiRaid.window ?? 30} seconds**, it triggers the configured action and enters a **5-minute cooldown** to prevent repeated alerts.`,
            "",
            "**Three actions available:**",
            "🔒 **Lock** — Sets server verification to the highest level. New/unverified accounts can't interact. Existing members are unaffected. *You'll need to manually lower it after the raid.*",
            "",
            "👢 **Kick** — Automatically kicks every new joiner during the active raid. Continues kicking for the full 5-minute cooldown window.",
            "",
            "📢 **Alert** — Sends a warning embed to staff but takes no automatic action. Best if you want human decision-making.",
            "",
            "**Alert channel:**",
            `${antiRaid.alertChannelId ? `Currently: <#${antiRaid.alertChannelId}>` : "Falls back to your logging channel. Set a dedicated one for faster staff response."}`,
            "",
            "**Your current config:**",
            `> Enabled: ${yesNo(antiRaidEnabled)}`,
            `> Threshold: **${antiRaid.threshold ?? 10}** joins`,
            `> Window: **${antiRaid.window ?? 30}s**`,
            `> Action: **${antiRaid.action ?? "lock"}**`,
            "",
            "**Commands:**",
            "`/antiraid enable` / `/antiraid disable`",
            "`/antiraid threshold <count>` — How many joins to trigger",
            "`/antiraid window <seconds>` — Time window (5–120s)",
            "`/antiraid action <lock/kick/alert>` — What happens",
            "`/antiraid channel #channel` — Where alerts go",
            "`/antiraid settings` — View current config",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 13 — REACTION ROLES & EXTRAS
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🎭 Reaction Roles & Utility")
        .setColor("Blue")
        .setDescription(
          [
            "**Reaction Roles**",
            "Create self-assign role panels where members click a reaction/button to get a role. Perfect for color roles, notification roles, or region pings.",
            "",
            "**How it works:**",
            "1. Create a reaction role panel with `/reactionrole create`",
            "2. Add roles to it — each gets its own emoji/button",
            "3. Post it in a channel — members click to toggle roles",
            "",
            "**Commands:**",
            "`/reactionrole create` — Create a new panel",
            "`/reactionrole add` — Add a role to an existing panel",
            "`/reactionrole remove` — Remove a role from a panel",
            "`/reactionrole edit` — Edit panel appearance",
            "`/reactionrole delete` — Delete a panel",
            "",
            "───────────────────────────",
            "",
            "**AFK System**",
            "Members can set themselves as AFK. Anyone who pings them gets an automatic reply saying they're away.",
            "",
            "`/afk <reason>` — Set AFK status",
            "When they send a message again, AFK is automatically removed.",
            "",
            "───────────────────────────",
            "",
            "**Polls**",
            "`/poll` — Create a poll and send it to a specific channel. Members react to vote.",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 14 — FUN & SOCIAL COMMANDS
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🎮 Fun & Social Commands")
        .setColor("Blue")
        .setDescription(
          [
            "**What are these?**",
            "Lighthearted commands anyone can use. No setup needed — they work out of the box.",
            "",
            "🎱 `/8ball <question>` — Ask the magic 8-ball",
            "*Gives a random yes/no/maybe answer.*",
            "",
            "💬 `/compliment` — Get a random compliment",
            "*Sends a feel-good message from a curated list.*",
            "",
            "😂 `/meme` — Random meme from Reddit",
            "*Pulls fresh memes. Content is from public subreddits.*",
            "",
            "✂️ `/rps <choice>` — Rock Paper Scissors",
            "*Play against Ryvex. It picks randomly.*",
            "",
            "📏 `/ppmeter @user` — PP meter (just for laughs)",
            "🏳️‍🌈 `/gaymeter @user` — Gay meter (just for laughs)",
            "*Both generate a random % — purely comedic, no real data.*",
            "",
            "───────────────────────────",
            "",
            "**Info commands anyone can use:**",
            "`/ping` — Bot latency & connection health",
            "`/botinfo` — System stats, uptime, memory usage",
            "`/userinfo @user` — Member profile, roles, join date",
            "`/changelog` — View Ryvex update history",
            "`/history` — View your own moderation record",
            "`/support` — Join the Ryvex support server",
            "`/donate` — Support Ryvex development",
            "`/review` — Leave a review on Top.gg",
            "`/website` — Official Ryvex website",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 15 — PERMISSIONS GUIDE
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🔑 Permissions Reference")
        .setColor("Blue")
        .setDescription(
          [
            "**How Ryvex handles permissions:**",
            "Every command checks **Discord's built-in permissions** — not a custom role system. If Discord says you can ban, Ryvex lets you ban.",
            "",
            "**🔴 Administrator** (server owners/admins)",
            "`/setup` `/settings` `/logging` `/moderation`",
            "`/welcome` `/antiraid` `/xp` `/automod`",
            "`/automod-*` `/rules-admin` `/appeal-admin` `/poll`",
            "",
            "**🟠 Manage Roles**",
            "`/add-role` `/remove-role` `/reactionrole`",
            "",
            "**🟡 Manage Channels**",
            "`/lock` `/unlock` `/slowmode`",
            "",
            "**🟢 Manage Messages**",
            "`/clear`",
            "",
            "**🔵 Moderate Members**",
            "`/timeout` `/untimeout` `/warn` `/case`",
            "`/history-user` `/history-staff` `/staff` `/staff-flags`",
            "",
            "**🟣 Ban Members**",
            "`/ban` `/unban`",
            "",
            "**⚪ Kick Members**",
            "`/kick`",
            "",
            "**✅ No permission needed (everyone)**",
            "`/help` `/ping` `/botinfo` `/userinfo` `/rank`",
            "`/leaderboard` `/history` `/rules` `/appeal` `/afk`",
            "`/8ball` `/compliment` `/meme` `/rps` + more",
            "",
            "**Tip:** Make sure Ryvex's bot role is **above** the roles it needs to manage in your role hierarchy.",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 16 — RECOMMENDED SETUP ORDER
         ═══════════════════════════════════════ */
      new EmbedBuilder()
        .setTitle("🧭 Recommended Setup Order")
        .setColor("Blue")
        .setDescription(
          [
            "**If you're starting from scratch, follow this order:**",
            "",
            "**Step 1 — Logging** (required)",
            "`/logging enable` → `/logging channel #server-logs`",
            "*Everything else depends on this.*",
            "",
            "**Step 2 — Moderation logs**",
            "`/moderation channel #mod-logs`",
            "*Separate channel for staff actions.*",
            "",
            "**Step 3 — Rules**",
            "`/rules-admin add <your first rule>`",
            "*Members can view with `/rules`.*",
            "",
            "**Step 4 — Welcome**",
            "`/welcome enable` → `/welcome channel #welcome`",
            "`/welcome autorole @Member`",
            "",
            "**Step 5 — AutoMod**",
            "`/automod enable` → `/automod preset medium`",
            "*Activates spam, links, and bad words at once.*",
            "",
            "**Step 6 — Appeals**",
            "`/appeal-admin config`",
            "*Gives punished members a voice.*",
            "",
            "**Step 7 — Anti-Raid**",
            "`/antiraid enable` → `/antiraid channel #staff-alerts`",
            "",
            "**Step 8 — Staff Monitoring**",
            "`/staff-flags enable`",
            "",
            "**Step 9 — Leveling**",
            "`/xp enable` → `/xp channel #level-ups`",
            "",
            "**Step 10 — Extras**",
            "Reaction roles, AFK, fun commands — all work with no setup.",
          ].join("\n")
        ),

      /* ═══════════════════════════════════════
         PAGE 17 — FINAL CHECKLIST
         ═══════════════════════════════════════ */
      (() => {
        const checks = [
          { name: "📜 Logging", ready: loggingReady },
          { name: "🛡 Moderation Logs", ready: moderationReady },
          { name: "👋 Welcome System", ready: welcomeEnabled },
          { name: "📜 Server Rules", ready: rulesConfigured },
          { name: "📨 Appeals", ready: appealsReady },
          { name: "🤖 AutoMod", ready: automodReady },
          { name: "🧑‍⚖️ Staff Monitoring", ready: staffMonitoringEnabled },
          { name: "📊 Leveling / XP", ready: levelingEnabled },
          { name: "🛡️ Anti-Raid", ready: antiRaidEnabled },
        ];

        const readyCount = checks.filter(c => c.ready).length;
        const total = checks.length;
        const allReady = readyCount === total;
        const barLength = 10;
        const filled = Math.round((readyCount / total) * barLength);
        const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

        const embed = new EmbedBuilder()
          .setTitle(allReady ? "🎉 Setup Complete!" : "📋 Setup Completion Checklist")
          .setColor(allReady ? "Green" : readyCount > total / 2 ? "Orange" : "Red")
          .setDescription(
            [
              allReady
                ? "**Your server is fully configured!** Every system is active and running."
                : "**Here's where you stand** — check what's active and what still needs attention.",
              "",
              `\`${bar}\` **${readyCount} / ${total}** systems active`,
              "",
              ...checks.map(c =>
                c.ready
                  ? `> ✅ ${c.name}`
                  : `> ❌ ${c.name}`
              ),
              "",
              allReady
                ? "🏆 **You're all set!** Ryvex is fully operational."
                : "💡 Use the **Recommended Setup Order** (page 16) to configure missing systems.",
              "",
              "**Need help?** Run `/support` to join the Ryvex support server.",
              "",
              "*You can re-run `/setup` anytime to check your progress.*",
            ].join("\n")
          );

        if (allReady) {
          embed.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 128 }));
        }

        return embed;
      })(),
    ];

    /* ───────── NAVIGATION (UNCHANGED) ───────── */
    let page = 0;

    const buildRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("◀ Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1),
        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("✖ Close")
          .setStyle(ButtonStyle.Danger)
      );

    const applyFooter = () =>
      pages[page].setFooter({
        text: `Page ${page + 1} / ${pages.length}`,
      });

    applyFooter();

    const msg = await interaction.editReply({
      embeds: [pages[page]],
      components: [buildRow()],
    });

    const collector = msg.createMessageComponentCollector({
      time: 300_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This setup menu isn’t for you.",
          ephemeral: true,
        });
      }

      await i.deferUpdate().catch(() => {});

      if (i.customId === "close") return collector.stop();
      if (i.customId === "prev" && page > 0) page--;
      if (i.customId === "next" && page < pages.length - 1) page++;

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
  },
};
