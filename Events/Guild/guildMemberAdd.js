const { EmbedBuilder } = require("discord.js");

const {
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { logEvent } = require("../../Utils/logEvent");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    const { guild, user } = member;

    // Fetch settings (auto-creates if missing)
    const settings = await getGuildSettings(guild.id);

    /* ───────── GENERAL LOGGING ───────── */
    if (
      settings.logging?.enabled &&
      settings.logging.events?.memberJoin
    ) {
      await logEvent({
        guild,
        title: "👋 Member Joined",
        description: `${user.tag} joined the server.`,
        color: "Green",
      });
    }

    /* ───────── WELCOME SYSTEM ───────── */
    if (!settings.welcome.enabled) return;

    const channelId = settings.welcome.channelId;
    const welcomeChannel = channelId
      ? guild.channels.cache.get(channelId)
      : null;

    // Add auto-role if configured
    if (settings.welcome.autoRoleId) {
      const role = guild.roles.cache.get(settings.welcome.autoRoleId);

      if (role) {
        try {
          await member.roles.add(role);
        } catch (error) {
          console.error("Failed to add auto-role:", error.message);
        }
      }
    }

    // Send welcome message if channel exists
    if (!welcomeChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome!")
      .setDescription(
        `Welcome ${member} to **${guild.name}**!\nWe’re glad to have you here 💙`
      )
      .setThumbnail(user.displayAvatarURL())
      .setColor("White")
      .setTimestamp();

    try {
      await welcomeChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Failed to send welcome message:", error.message);
    }
  },
};
