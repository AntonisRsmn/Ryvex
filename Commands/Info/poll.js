const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

// Shared poll state
const pollMessages = new Set();
const POLL_EMOJIS = ["✅", "❌"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll and send it to a specific channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("description")
        .setDescription("The question or topic of the poll.")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel where the poll will be posted.")
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
          content: "❌ Invalid channel selected.",
          flags: MessageFlags.Ephemeral,
        });
      }

      /* ───────── POLL EMBED ───────── */
      const pollEmbed = new EmbedBuilder()
        .setTitle("📊 Community Poll")
        .setColor("White")
        .setDescription(
          [
            `**${description}**`,
            "",
            "🗳 **How to vote:**",
            "• React with **✅** for Yes",
            "• React with **❌** for No",
          ].join("\n")
        )
        .setFooter({
          text: `Poll created by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      const message = await channel.send({ embeds: [pollEmbed] });

      for (const emoji of POLL_EMOJIS) {
        await message.react(emoji);
      }

      pollMessages.add(message.id);

      /* ───────── CONFIRMATION ───────── */
      return respond(interaction, {
        embeds: [
          new EmbedBuilder()
            .setColor("White")
            .setDescription(
              [
                "✅ **Poll successfully created**",
                "",
                `📍 Channel: ${channel}`,
                "📊 Reactions added automatically.",
              ].join("\n")
            ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("[Poll] Creation failed:", error);

      return respond(interaction, {
        content: "❌ Failed to create the poll.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
