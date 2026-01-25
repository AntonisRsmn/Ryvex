const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const GuildRules = require("../../Database/models/GuildRules");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("View the server rules"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const data = await GuildRules.findOne({
      guildId: interaction.guild.id,
    });

    if (!data || !data.rules.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📜 Server Rules")
            .setColor("Red")
            .setDescription(
              "⚠️ **No rules have been configured yet.**\n\n" +
              "Please contact a moderator if this seems incorrect."
            )
            .setTimestamp(),
        ],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📜 Server Rules")
      .setColor("Blue")
      .setDescription(
        [
          "Please read and follow all rules below.",
          "Breaking rules may result in moderation actions.",
          "",
          ...data.rules
            .sort((a, b) => a.id - b.id)
            .map(
              r =>
                `**${r.id}. ${r.title}**\n${r.description}`
            ),
        ].join("\n\n")
      )
      .setFooter({
        text: "Ryvex • Rules are enforced at moderator discretion",
      })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
