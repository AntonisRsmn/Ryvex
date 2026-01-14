const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    const client = interaction.client;

    /* ───────── BUTTON HANDLING ───────── */
    if (interaction.isButton()) {
      const { customId, member, guild } = interaction;

      // ── SETTINGS DASHBOARD BUTTONS ──

      if (customId === "settings_logging_enable") {
        return interaction.reply({
          content: "✅ Run `/settings logging enable` to enable logging.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (customId === "settings_logging_channel") {
        return interaction.reply({
          content: "📄 Run `/settings logging channel #channel` to set the log channel.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (customId === "settings_logging_privacy") {
        return interaction.reply({
          content:
            "🔐 Run `/settings logging privacy status` to check privacy mode.\n" +
            "Use `/settings logging privacy on|off` to change it.",
          flags: MessageFlags.Ephemeral,
        });
      }


      /* ── BOT MENTION MENU BUTTONS ── */

      // SETTINGS button → admin-only
      if (customId === "open_settings") {
        const isAdmin = member.permissions.has(
          PermissionFlagsBits.Administrator
        );

        if (!isAdmin) {
          return interaction.reply({
            content:
              "❌ You need **Administrator** permission to use `/settings`.",
            flags: MessageFlags.Ephemeral,
          });
        }

        return interaction.reply({
          content: "⚙️ Run `/settings` to configure server options.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // SETUP button
      if (customId === "open_setup") {
        return interaction.reply({
          content: "🔧 Run `/setup` to get Ryvex ready for your server.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // CHANGELOG button
      if (customId === "open_changelog") {
        return interaction.reply({
          content: "🧾 Run `/changelog latest` to see the latest updates.",
          flags: MessageFlags.Ephemeral,
        });
      }

      // Unknown button → safely acknowledge
      return interaction.deferUpdate().catch(() => {});
    }

    /* ───────── SLASH COMMAND HANDLING ───────── */
    if (!interaction.isChatInputCommand()) return;

    // Guild-only protection
    if (!interaction.guild) {
      const embed = new EmbedBuilder()
        .setTitle("Ryvex™")
        .setDescription("❌ Commands can only be used inside servers.")
        .setColor("White")
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      // IMPORTANT: log only — NEVER reply here
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );
    }
  },
};
