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

    // 50 random welcome messages, use <username> for mention and <servername> for guild name
    // Secret rare messages inspired by Alan Wake 2, Silent Hill, and Resident Evil
    const secretMessages = [
      // Alan Wake 2 (unique, atmospheric)
      "A flicker of light follows <username> into <servername>. The Dark Place is never far behind.",
      "<username> steps into <servername>, pen in hand, reality shifting with every word. Beware the shadows that listen.",
      // Silent Hill 2 Remake (unique, atmospheric)
      "The fog thickens as <username> enters <servername>. Guilt and hope echo in every silent street.",
      "A broken radio crackles as <username> arrives in <servername>. Sometimes, the monsters wear familiar faces.",
      // Resident Evil Requiem (unique, atmospheric)
      "The scent of gunpowder and ink greets <username> in <servername>. Every step could be your last in this requiem.",
      "Footsteps echo in empty halls as <username> joins <servername>. The requiem has only just begun."
    ];

    // Regular welcome messages
    const randomMessages = [
      // --- Secret game-inspired messages ---
      // Alan Wake 2
      "<username> arrives in <servername> as the darkness stirs. Remember: words have power, and the shadows are listening...",
      "A manuscript page turns for <username> in <servername>. Beware the Taken, and keep your flashlight close.",
      // Silent Hill
      "The siren echoes as <username> enters <servername>. Is this reality, or just another layer of the fog?",
      "Footsteps fade into the mist as <username> joins <servername>. Sometimes, the scariest monsters are within.",
      // Resident Evil Requiem
      "A typewriter clicks as <username> joins <servername>. Will you survive the horrors that lurk beyond the mansion doors?",
      "Welcome, <username>. In <servername>, every corridor could be your last—don’t forget your green herbs.",
      // --- Regular messages ---
      "Welcome <username> to <servername>! 🎉",
      "Hey <username>, glad you joined <servername>!",
      "A wild <username> appeared in <servername>!",
      "Everyone, say hi to <username>! 👋",
      "<username> just landed in <servername>! 🚀",
      "Look who joined: <username>! Welcome!",
      "<username>, welcome to the best server: <servername>!",
      "Give a warm welcome to <username>!",
      "<username> joined the party in <servername>! 🥳",
      "<username> is here! Let’s celebrate!",
      "Welcome aboard, <username>!",
      "<username>, you’re now part of <servername>!",
      "Glad to have you, <username>!",
      "<username> has joined the crew!",
      "<username>, welcome to your new home: <servername>!",
      "<username> just joined. Everyone behave! 😁",
      "<username> has entered the chat!",
      "Welcome, <username>! Enjoy your stay at <servername>!",
      "<username> joined. Let’s make some memories!",
      "<username>, welcome! We’ve been expecting you!",
      "<username> just teleported into <servername>!",
      "<username> has arrived! Let’s get the party started!",
      "<username> just unlocked a new achievement: Joined <servername>! 🏆",
      "<username> is now among us!",
      "<username> just spawned in <servername>!",
      "<username> joined the squad!",
      "<username> just crossed the threshold into <servername>!",
      "<username> is now a part of our family!",
      "<username> just hopped on board <servername>!",
      "<username> joined the adventure!",
      "<username> just made <servername> even better!",
      "<username> joined. Let’s show them some love! ❤️",
      "<username> just joined the fun zone!",
      "<username> is now a legend in <servername>!",
      "<username> joined. The more, the merrier!",
      "<username> just joined the hype train! 🚂",
      "<username> is now rolling with us!",
      "<username> joined. Let’s make some noise!",
      "<username> just joined the coolest server: <servername>!",
      "<username> is now a VIP in <servername>!",
      "<username> joined. Let’s give them a warm welcome!",
      "<username> just joined the squad goals!",
      "<username> is now a part of the <servername> universe!",
      "<username> joined. Let’s get this party started!",
      "<username> just joined the best community ever!",
      "<username> is now a part of the <servername> journey!",
      "<username> joined. Let’s make history together!",
      "<username> just joined the winning team!",
      "<username> is now a part of the <servername> crew!",
      "<username> joined. Let’s create some memories!",
      "<username> just joined the <servername> family!",
      "<username> is now a part of our story!",
      "<username> joined. Let’s welcome them with open arms!",
      "<username> just joined. Let’s show them what <servername> is all about!"
    ];

    let welcomeMsg;
    if (settings.welcome.randomMessagesEnabled) {
      // 2% chance to get a secret message (very rare)
      if (Math.random() < 0.02) {
        welcomeMsg = secretMessages[Math.floor(Math.random() * secretMessages.length)];
      } else {
        welcomeMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      }
    } else if (settings.welcome.message) {
      welcomeMsg = settings.welcome.message;
    } else {
      welcomeMsg = `Welcome <username> to **${guild.name}**!\nWe’re glad to have you here 💙`;
    }
    // Replace placeholders
    welcomeMsg = welcomeMsg
      .replace(/<username>/gi, `<@${member.user.id}>`)
      .replace(/<servername>/gi, `**${guild.name}**`);

    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome!")
      .setDescription(welcomeMsg)
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
