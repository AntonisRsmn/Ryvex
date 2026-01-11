const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
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
    try {
      const { channel, guild, options } = interaction;

      if (!guild) {
        return respond(interaction, {
          content: "❌ This command can only be used in servers.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildAnnouncement &&
        !channel.isThread()
      ) {
        return respond(interaction, {
          content: "❌ This channel does not support message deletion.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const amount = options.getInteger("amount");
      const target = options.getUser("target");

      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return respond(interaction, {
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
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ Failed to fetch messages from this channel.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      const toDelete = target
        ? messages.filter(m => m.author?.id === target.id).first(amount)
        : messages.first(amount);

      if (!Array.isArray(toDelete) || toDelete.length === 0) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ No messages found to delete.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      let deleted;
      try {
        deleted = await channel.bulkDelete(toDelete, true);
      } catch {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "❌ Failed to delete messages. They may be too old or I lack permissions."
              )
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      await logAction({
        guild,
        action: "Clear Messages",
        moderator: interaction.user,
        target: target ?? null,
        reason: target
          ? `Cleared ${deleted.size} messages from ${target.tag}`
          : `Cleared ${deleted.size} messages in #${channel.name}`,
      });

      return respond(interaction, {
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

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ An unexpected error occurred while clearing messages.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
