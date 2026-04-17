const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const { logEvent } = require("../../Utils/logEvent");
const { trackJoin, isRaidActive, setRaidActive } = require("../../Utils/raidTracker");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    try {
    const { guild, user } = member;
    const settings = await getGuildSettings(guild.id);
    if (!settings) return;

    /* ───────── ANTI-RAID CHECK ───────── */
    const antiRaid = settings.antiRaid ?? {};
    if (antiRaid.enabled && !isRaidActive(guild.id)) {
      const threshold = antiRaid.threshold ?? 10;
      const window = antiRaid.window ?? 30;
      const triggered = trackJoin(guild.id, threshold, window);

      if (triggered) {
        setRaidActive(guild.id);
        console.warn(`[ANTI-RAID] Raid detected in ${guild.name} (${guild.id})`);

        // Determine alert channel
        const alertChannel = antiRaid.alertChannelId
          ? guild.channels.cache.get(antiRaid.alertChannelId)
          : settings.logging?.channelId
            ? guild.channels.cache.get(settings.logging.channelId)
            : null;

        const alertEmbed = new EmbedBuilder()
          .setTitle("🚨 Raid Detected!")
          .setColor("Red")
          .setDescription(
            [
              `**${threshold}+ members** joined within **${window}s**.`,
              "",
              `Action taken: **${antiRaid.action ?? "lock"}**`,
              "",
              "Anti-raid cooldown active for **5 minutes** — duplicate triggers are suppressed.",
            ].join("\n")
          )
          .setTimestamp();

        // Execute action
        if (antiRaid.action === "kick") {
          // Kick all recent joiners from the raid window
          const windowMs = (antiRaid.window ?? 30) * 1000;
          const cutoff = Date.now() - windowMs;
          const recentMembers = guild.members.cache.filter(
            m => !m.user.bot && m.joinedTimestamp && m.joinedTimestamp >= cutoff && m.kickable
          );
          await Promise.all(
            recentMembers.map(m => m.kick("Anti-raid: mass join detected").catch(() => {}))
          );
        } else if (antiRaid.action === "lock") {
          // Set verification to highest level, auto-restore after 5 minutes
          try {
            const previousLevel = guild.verificationLevel;
            await guild.setVerificationLevel(4, "Anti-raid: mass join detected");
            setTimeout(async () => {
              try {
                await guild.setVerificationLevel(previousLevel, "Anti-raid: auto-restore after cooldown");
              } catch (err) {
                console.error("[ANTI-RAID] Failed to restore verification level:", err.message);
              }
            }, 5 * 60 * 1000);
          } catch (err) {
            console.error("[ANTI-RAID] Failed to set verification level:", err.message);
          }
        }
        // "alert" action = just send the embed, no other action

        if (alertChannel) {
          alertChannel.send({ embeds: [alertEmbed] }).catch(() => {});
        }
      }
    } else if (antiRaid.enabled) {
      // Still track joins even during active raid
      trackJoin(guild.id, antiRaid.threshold ?? 10, antiRaid.window ?? 30);

      // Kick during active raid if action is kick
      if (antiRaid.action === "kick" && member.kickable) {
        await member.kick("Anti-raid: active raid lockdown").catch(() => {});
      }
    }

    /* ───────── GENERAL LOGGING ───────── */
    const memberJoinEnabled =
      settings.logging?.events?.memberJoin ?? true;

    if (settings.logging?.enabled && memberJoinEnabled) {
      await logEvent({
        guild,
        title: "👋 Member Joined",
        description: `${user.tag} joined the server.`,
        color: "Green",
      });
    }

    /* ───────── WELCOME SYSTEM ───────── */
    if (!settings.welcome?.enabled) return;

    const welcomeChannel = settings.welcome.channelId
      ? guild.channels.cache.get(settings.welcome.channelId)
      : null;

    if (settings.welcome.autoRoleId) {
      const role = guild.roles.cache.get(settings.welcome.autoRoleId);
      if (role) {
        try {
          await member.roles.add(role);
        } catch (err) {
          console.error("Failed to add auto-role:", err.message);
        }
      }
    }

    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome!")
      .setDescription(
        `Welcome ${member} to **${guild.name}**!\nWe’re glad to have you here 💙`
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor("White")
      .setTimestamp();

    welcomeChannel.send({ embeds: [embed] }).catch(err =>
      console.error("Failed to send welcome message:", err.message)
    );
    } catch (err) {
      console.error("[guildMemberAdd]", err);
    }
  },
};
