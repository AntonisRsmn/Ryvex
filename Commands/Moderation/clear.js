const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChannelType,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");
const { suppressNextDeletes } = require("../../Utils/messageDeleteSuppressor");

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
    const { channel, guild, options, user: moderator } = interaction;

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

    const amount = options.getInteger("amount");
    const target = options.getUser("target");

    const fetched = await channel.messages.fetch({ limit: 100 });

    const messages = target
      ? fetched.filter(m => m.author?.id === target.id).first(amount)
      : fetched.first(amount);

    if (!messages.length) {
      return respond(interaction, {
        content: "❌ No messages found to delete.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 🔕 SUPPRESS messageDelete GENERAL LOGS
    suppressNextDeletes(guild.id, messages.length);

    const deleted = await channel.bulkDelete(messages, true);

    // 🛡 MODERATION LOG ONLY
    await logAction({
      guild,
      action: "Clear Messages",
      moderator,
      target: target ?? moderator,
      reason: target
        ? `Cleared ${deleted.size} messages from ${target.tag} in #${channel.name}`
        : `Cleared ${deleted.size} messages in #${channel.name}`,
      extra: {
        channel: channel.id,
        amount: deleted.size,
      },
    });

    /* ───────── SUCCESS UX (IMPROVED) ───────── */
    return respond(interaction, {
      embeds: [
        new EmbedBuilder()
          .setTitle("🧹 Messages Cleared")
          .setColor("White")
          .addFields(
            {
              name: "📍 Channel",
              value: `${channel}`,
              inline: true,
            },
            {
              name: "🗑 Messages Deleted",
              value: `${deleted.size}`,
              inline: true,
            },
            {
              name: "👮 Moderator",
              value: `${moderator}`,
              inline: false,
            },
            {
              name: "🎯 Target",
              value: target ? `${target}` : "All users",
              inline: false,
            }
          )
          .setFooter({
            text: "Ryvex • Moderation Action",
          })
          .setTimestamp(),
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
