const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { respond } = require("../../Utils/respond");

const MIN_COOLDOWN_HOURS = 1;
const MAX_COOLDOWN_HOURS = 168;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("appeal-admin")
    .setDescription("Manage the appeal system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(sub =>
      sub
        .setName("config")
        .setDescription("Configure the appeal system")
        .addBooleanOption(opt =>
          opt.setName("enabled").setDescription("Enable or disable appeals")
        )
        .addChannelOption(opt =>
          opt.setName("channel").setDescription("Set appeals channel")
        )
        .addIntegerOption(opt =>
          opt
            .setName("cooldown")
            .setDescription("Appeal cooldown (hours)")
            .setMinValue(MIN_COOLDOWN_HOURS)
            .setMaxValue(MAX_COOLDOWN_HOURS)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("close")
        .setDescription("Close an appeal thread")
        .addStringOption(opt =>
          opt
            .setName("reason")
            .setDescription("Reason for closing")
            .setMaxLength(500)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("reopen")
        .setDescription("Reopen an appeal thread")
        .addStringOption(opt =>
          opt
            .setName("reason")
            .setDescription("Reason for reopening")
            .setMaxLength(500)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const settings = await getGuildSettings(interaction.guild.id);

    /* ───────── CONFIG (keep plain text) ───────── */
    if (sub === "config") {
      const updates = {};
      const enabled = interaction.options.getBoolean("enabled");
      const channel = interaction.options.getChannel("channel");
      const cooldown = interaction.options.getInteger("cooldown");

      if (enabled !== null) updates["appeals.enabled"] = enabled;
      if (channel) updates["appeals.channelId"] = channel.id;
      if (cooldown !== null) {
        updates["appeals.cooldownMs"] = cooldown * 60 * 60 * 1000;
      }

      if (Object.keys(updates).length) {
        await updateGuildSettings(interaction.guild.id, updates);
      }

      return respond(interaction, {
        content: "⚙️ Appeal configuration updated.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!interaction.channel?.isThread()) {
      return respond(interaction, {
        content: "❌ This command must be used inside an appeal thread.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      !settings.appeals.channelId ||
      interaction.channel.parentId !== settings.appeals.channelId
    ) {
      return respond(interaction, {
        content: "❌ This is not an appeal thread.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const reason =
      interaction.options.getString("reason") || "No reason provided.";

    /* ───────── CLOSE ───────── */
    if (sub === "close") {
      const embed = new EmbedBuilder()
        .setTitle("🔒 Appeal Closed")
        .setColor("DarkGrey")
        .addFields(
          { name: "Closed by", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      await respond(interaction, {
        content: "✅ Appeal closed.",
        flags: MessageFlags.Ephemeral,
      });

      await interaction.channel.setLocked(true);
      await interaction.channel.setArchived(true);
    }

    /* ───────── REOPEN ───────── */
    if (sub === "reopen") {
      if (!interaction.channel.archived) {
        return respond(interaction, {
          content: "❌ This appeal is already open.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.channel.setArchived(false);
      await interaction.channel.setLocked(false);

      const embed = new EmbedBuilder()
        .setTitle("🔓 Appeal Reopened")
        .setColor("Green")
        .addFields(
          { name: "Reopened by", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      return respond(interaction, {
        content: "✅ Appeal reopened.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
