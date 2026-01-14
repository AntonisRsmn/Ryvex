const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");
const { suppress } = require("../../Utils/actionSuppressor"); // ✅ NEW

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to lock.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for locking the channel.")
    ),

  async execute(interaction) {
    try {
      const { guild, options, user: moderator } = interaction;
      const channel = options.getChannel("channel");
      const reason = options.getString("reason") || "No reason provided";

      /* ───────── BOT PERMISSION CHECK ───────── */
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ I don't have permission to manage channels.")
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── ALREADY LOCKED CHECK ───────── */
      const everyonePerms = channel.permissionsFor(guild.roles.everyone);

      if (
        !everyonePerms ||
        !everyonePerms.has(PermissionFlagsBits.SendMessages)
      ) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`❌ ${channel} is already locked.`)
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── SUPPRESS GENERAL LOGS ───────── */
      suppress(channel.id); // ✅ CRITICAL FIX

      /* ───────── EXECUTE LOCK ───────── */
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: false },
        { reason }
      );

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        type: "moderation",
        action: "Channel Lock",
        target: channel,
        moderator,
        reason,
      });

      /* ───────── SUCCESS UX ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔒 Channel Locked")
            .setColor("White")
            .addFields(
              {
                name: "📍 Channel",
                value: `${channel}`,
                inline: true,
              },
              {
                name: "👮 Moderator",
                value: `${moderator}`,
                inline: true,
              },
              {
                name: "📝 Reason",
                value: reason,
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
    } catch (error) {
      console.error("Lock failed:", error);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to lock the channel.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
