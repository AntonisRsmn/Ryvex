const { EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");
const { logEvent } = require("../../Utils/logEvent");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    const { guild, user } = member;
    const settings = await getGuildSettings(guild.id);

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
    if (!settings.welcome.enabled) return;

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
  },
};
