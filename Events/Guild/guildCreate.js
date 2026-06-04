const { EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("../../Database/services/guildSettingsService");

module.exports = {
  name: "guildCreate",

  async execute(guild) {
    try {
      console.log(`✅ Bot added to guild: ${guild.name} (${guild.id})`);

      /* ───────── DATABASE INITIALIZATION ───────── */
      // This ensures all settings are created and defaults are applied
      const settings = await getGuildSettings(guild.id);

      if (!settings) {
        console.error(`[CRITICAL] Failed to initialize database for guild ${guild.id}`);
        return;
      }

      console.log(`✅ Database initialized for ${guild.name}`);

      /* ───────── WELCOME MESSAGE ───────── */
      // Send welcome DM to the server owner
      try {
        const owner = await guild.fetchOwner();
        const welcomeEmbed = new EmbedBuilder()
          .setTitle("🎉 Thanks for adding Ryvex!")
          .setColor("Blurple")
          .setDescription(
            [
              "Ryvex is now in your server and ready to help!",
              "",
              "**Quick Start:**",
              "> 1. Run `/setup` for an interactive setup guide",
              "> 2. Run `/help` to see all available commands",
              "> 3. Run `/settings view` to see current configuration",
              "",
              "**Popular features:**",
              "> 🛡 **Moderation** — ban, kick, warn, timeout, and more",
              "> 🤖 **AutoMod** — automatic spam, links, and bad word filtering",
              "> 📊 **Leveling** — XP system with role rewards",
              "> 🛡️ **Anti-Raid** — protect your server from raids",
              "> 📨 **Appeal System** — streamline ban appeals",
              "> 📜 **Logging** — comprehensive audit logging",
              "",
              "**Support:**",
              "> Questions? Run `/support` to join our support server",
              "> Documentation: Run `/website` for full docs",
            ].join("\n")
          )
          .setFooter({ text: "Ryvex • Community Moderation Bot" })
          .setTimestamp();

        await owner.send({ embeds: [welcomeEmbed] }).catch(err => {
          console.warn(`Could not DM owner of ${guild.name}:`, err.message);
        });
      } catch (err) {
        console.error(`Failed to fetch/message owner of ${guild.id}:`, err.message);
      }

      /* ───────── LOGGING ───────── */
      try {
        // Try to find a general or welcome channel
        const defaultChannel =
          guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has("SendMessages")) ||
          guild.systemChannel;

        if (defaultChannel && defaultChannel.permissionsFor(guild.members.me).has("SendMessages")) {
          const announceEmbed = new EmbedBuilder()
            .setTitle("👋 Ryvex is now active!")
            .setColor("Green")
            .setDescription(
              [
                "Your server admin received a setup guide via DM.",
                "",
                "**Get started:**",
                "> `/setup` — Interactive server configuration",
                "> `/help` — Command list",
                "> `/settings view` — View current settings",
              ].join("\n")
            )
            .setFooter({ text: "Ryvex • Type /help for more" })
            .setTimestamp();

          await defaultChannel.send({ embeds: [announceEmbed] }).catch(() => {});
        }
      } catch (err) {
        console.error(`Failed to send announcement to ${guild.id}:`, err.message);
      }

    } catch (error) {
      console.error(`[guildCreate] Critical error for ${guild?.name ?? "unknown"}:`, error);
    }
  },
};
