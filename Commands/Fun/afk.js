const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const Afk = require("../../Database/models/Afk");
const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set your AFK status. The bot will notify anyone who pings you.")
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Why are you going AFK?")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const reason = interaction.options.getString("reason") || "AFK";
      const { user, guild } = interaction;

      const existing = await Afk.findOne({
        guildId: guild.id,
        userId: user.id,
      });

      if (existing) {
        await Afk.deleteOne({ guildId: guild.id, userId: user.id });

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`✅ Welcome back, ${user}! Your AFK status has been removed.`);

        return respond(interaction, {
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      await Afk.findOneAndUpdate(
        { guildId: guild.id, userId: user.id },
        { reason },
        { upsert: true, returnDocument: 'after' }
      );

      const embed = new EmbedBuilder()
        .setColor("White")
        .setDescription(
          [
            `💤 ${user}, you are now **AFK**.`,
            `> **Reason:** ${reason}`,
            "",
            "I'll let others know when they mention you.",
            "Send any message or use `/afk` again to remove it.",
          ].join("\n")
        );

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("AFK command failed:", error);

      return respond(interaction, {
        content: "❌ Something went wrong while setting your AFK status.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
