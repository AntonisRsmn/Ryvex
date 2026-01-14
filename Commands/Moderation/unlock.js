const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");
const { logAction } = require("../../Utils/logAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a text channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to unlock.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const { guild, options, user: moderator } = interaction;
      const channel = options.getChannel("channel");

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

      /* ───────── ALREADY UNLOCKED CHECK ───────── */
      const everyonePerms = channel.permissionsFor(guild.roles.everyone);

      if (
        everyonePerms &&
        everyonePerms.has(PermissionFlagsBits.SendMessages)
      ) {
        return respond(interaction, {
          embeds: [
            new EmbedBuilder()
              .setDescription(`❌ ${channel} is already unlocked.`)
              .setColor("Red"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── EXECUTE UNLOCK ───────── */
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: null }
      );

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        type: "moderation",
        action: "Channel Unlock",
        target: channel,
        moderator,
        reason: "Channel unlocked",
      });

      /* ───────── SUCCESS UX (IMPROVED) ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔓 Channel Unlocked")
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
                name: "📝 Status",
                value: "Members can send messages again.",
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
      console.error("Unlock failed:", error);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to unlock the channel.")
            .setColor("Red"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
