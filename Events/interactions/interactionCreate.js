const {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");

const Afk = require("../../Database/models/Afk");
const ReactionRole = require("../../Database/models/ReactionRole");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {
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

      /* ── REACTION ROLE BUTTONS ── */
      if (customId.startsWith("rr_")) {
        const parts = customId.split("_");
        // Format: rr_<messageId>_<roleId>
        const roleId = parts[parts.length - 1];
        const messageId = parts.slice(1, parts.length - 1).join("_");

        const panel = await ReactionRole.findOne({
          guildId: guild.id,
          messageId,
        });

        if (!panel) {
          return interaction.reply({
            content: "❌ This reaction role panel no longer exists.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const entry = panel.roles.find(r => r.roleId === roleId);
        if (!entry) {
          return interaction.reply({
            content: "❌ This role is no longer on the panel.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const role = guild.roles.cache.get(roleId);
        if (!role) {
          return interaction.reply({
            content: "❌ That role no longer exists.",
            flags: MessageFlags.Ephemeral,
          });
        }

        try {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            return interaction.reply({
              content: `${entry.emoji} Removed **${role.name}**.`,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            await member.roles.add(roleId);
            return interaction.reply({
              content: `${entry.emoji} Added **${role.name}**.`,
              flags: MessageFlags.Ephemeral,
            });
          }
        } catch {
          return interaction.reply({
            content: "❌ I couldn't manage that role. Check my permissions and role hierarchy.",
            flags: MessageFlags.Ephemeral,
          });
        }
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

    // Clear AFK status when user runs any command (except /afk itself)
    if (interaction.commandName !== "afk" && interaction.guild) {
      Afk.findOneAndDelete({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
      }).catch(() => {});
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      // IMPORTANT: log only — NEVER reply here
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );
    }
    } catch (err) {
      console.error("[interactionCreate]", err);
    }
  },
};
