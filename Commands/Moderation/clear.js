const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete up to 99 messages from a channel or a specific user.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–99).")
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("Only delete messages from this user.")
    ),

  async execute(interaction) {
    const { channel, guild, member: moderator, options } = interaction;
    const amount = options.getInteger("amount");
    const target = options.getUser("target");

    /* ───────── BOT PERMISSION CHECK ───────── */
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to manage messages.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let messages;
    try {
      messages = await channel.messages.fetch({ limit: 100 });
    } catch {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to fetch messages from this channel.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let toDelete;

    if (target) {
      toDelete = messages
        .filter(msg => msg.author.id === target.id)
        .first(amount);
    } else {
      toDelete = messages.first(amount);
    }

    if (!toDelete.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ No messages found to delete.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const deleted = await channel.bulkDelete(toDelete, true);

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        type: "moderation",
        action: "Clear Messages",
        moderator: interaction.user,
        target: target ?? null,
        reason: target
          ? `Cleared ${deleted.size} messages from ${target.tag}`
          : `Cleared ${deleted.size} messages in #${channel.name}`,
        extra: {
          channel: channel.name,
          count: deleted.size,
        },
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              target
                ? `✅ Deleted **${deleted.size}** messages from **${target.tag}**.\n⚠️ Messages older than 14 days are ignored.`
                : `✅ Deleted **${deleted.size}** messages from this channel.\n⚠️ Messages older than 14 days are ignored.`
            )
            .setColor("White")
            .setTimestamp(),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Clear failed:", error);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ Failed to delete messages. Some may be too old or I lack permissions."
            )
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
