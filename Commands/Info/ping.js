const { SlashCommandBuilder, EmbedBuilder, MessageFlags, } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Show the bot's latency."),

  async execute(interaction) {
    try {
      const ping = Math.round(interaction.client.ws.ping);

      const embed = new EmbedBuilder()
        .setTitle("🏓 Pong!")
        .setDescription(`Latency: **${ping} ms**`)
        .setColor("White")
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Ping command failed:", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Failed to fetch latency.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
