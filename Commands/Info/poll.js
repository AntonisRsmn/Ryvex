const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

// Shared poll state (require cache)
const pollMessages = new Set();
const POLL_EMOJIS = ["✅", "❌"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll and send it to a certain channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("description")
        .setDescription("Describe the poll.")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Where do you want to send the poll?")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  pollMessages,
  POLL_EMOJIS,

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel("channel");
      const description = interaction.options.getString("description");

      if (!channel) {
        return respond(interaction, {
          content: "❌ Channel not found.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const pollEmbed = new EmbedBuilder()
        .setTitle("📊 Poll")
        .setDescription(description)
        .setColor("White")
        .setFooter({
          text: `By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      const message = await channel.send({ embeds: [pollEmbed] });

      for (const emoji of POLL_EMOJIS) {
        await message.react(emoji);
      }

      pollMessages.add(message.id);

      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Poll sent to ${channel}.`)
            .setColor("White"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("[Poll] Creation failed:", error);

      return respond(interaction, {
        content: "❌ Failed to create poll.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
