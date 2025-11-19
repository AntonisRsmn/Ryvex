const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");

// Poll message IDs (shared via require cache)
const pollMessages = [];
const POLL_EMOJIS = ["✅", "❌"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll and send it to a certain channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Describe the poll.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Where do you want to send the poll?")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  pollMessages,
  POLL_EMOJIS,

  async execute(interaction) {
    const safeReply = async (payload) => {
      try {
        if (interaction.replied || interaction.deferred) {
          return interaction.followUp({ ...payload, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
        return interaction.reply({ ...payload, flags: MessageFlags.Ephemeral }).catch(() => {});
      } catch {}
    };

    try {
      const channel = interaction.options.getChannel("channel");
      const description = interaction.options.getString("description");

      if (!channel) {
        return safeReply({ content: "Channel not found." });
      }

      const pollEmbed = new EmbedBuilder()
        .setColor(0xfffffe)
        .setTitle("Poll")
        .setDescription(description)
        .setFooter({
          text: `By ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      const confirmEmbed = new EmbedBuilder()
        .setColor(0xfffffe)
        .setTitle(`Poll sent to #${channel.name}`)
        .setTimestamp();

      const sent = await channel.send({ embeds: [pollEmbed] });

      // React with allowed poll emojis
      for (const e of POLL_EMOJIS) {
        await sent.react(e).catch(() => {});
      }

      pollMessages.push(sent.id);

      await safeReply({ embeds: [confirmEmbed] });
    } catch (err) {
      console.error("[Poll] Error creating poll:", err);
      await safeReply({ content: "Failed to create poll." });
    }
  },
};