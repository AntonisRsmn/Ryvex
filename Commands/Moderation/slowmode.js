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
    .setName("slowmode")
    .setDescription("Set slowmode on a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(option =>
      option
        .setName("seconds")
        .setDescription("Slowmode delay in seconds (0 to disable).")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to set slowmode on (defaults to current).")
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    try {
      const { guild, options, user: moderator } = interaction;
      const seconds = options.getInteger("seconds");
      const channel = options.getChannel("channel") ?? interaction.channel;

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

      /* ───────── SET SLOWMODE ───────── */
      await channel.setRateLimitPerUser(seconds, `Slowmode set by ${moderator.tag}`);

      /* ───────── FORMAT DURATION ───────── */
      let display;
      if (seconds === 0) {
        display = "Disabled";
      } else if (seconds < 60) {
        display = `${seconds}s`;
      } else if (seconds < 3600) {
        display = `${Math.floor(seconds / 60)}m ${seconds % 60 ? `${seconds % 60}s` : ""}`.trim();
      } else {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        display = `${h}h${m ? ` ${m}m` : ""}`;
      }

      /* ───────── MODERATION LOG ───────── */
      await logAction({
        guild,
        action: seconds === 0 ? "Slowmode Disabled" : "Slowmode Set",
        target: channel,
        moderator,
        reason: `Slowmode ${seconds === 0 ? "disabled" : `set to ${display}`}`,
      });

      /* ───────── SUCCESS UX ───────── */
      const embed = new EmbedBuilder()
        .setColor("White")
        .setTitle(seconds === 0 ? "⏱ Slowmode Disabled" : "⏱ Slowmode Set")
        .addFields(
          { name: "📍 Channel", value: `${channel}`, inline: true },
          { name: "⏳ Delay", value: display, inline: true },
          { name: "👮 Moderator", value: `${moderator}`, inline: true }
        );

      return respond(interaction, { embeds: [embed] });
    } catch (error) {
      console.error("Slowmode command failed:", error);
      return respond(interaction, {
        content: "❌ Failed to set slowmode.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
