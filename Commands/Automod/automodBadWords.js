const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod-badwords")
    .setDescription("Manage AutoMod custom bad words")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(s =>
      s.setName("enable").setDescription("Enable custom bad words")
    )
    .addSubcommand(s =>
      s.setName("disable").setDescription("Disable custom bad words")
    )
    .addSubcommand(s =>
      s
        .setName("add")
        .setDescription("Add a custom bad word")
        .addStringOption(o =>
          o
            .setName("word")
            .setDescription("Word to block")
            .setRequired(true)
        )
    )
    .addSubcommand(s =>
      s
        .setName("remove")
        .setDescription("Remove a custom bad word")
        .addStringOption(o =>
          o
            .setName("word")
            .setDescription("Word to remove")
            .setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName("view").setDescription("View custom bad words")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const settings = await getGuildSettings(guildId);
    const bw = settings.automod.badWordsCustom;

    if (sub === "enable") bw.enabled = true;
    if (sub === "disable") bw.enabled = false;

    if (sub === "add") {
      const word = interaction.options.getString("word").toLowerCase();
      if (!bw.words.includes(word)) bw.words.push(word);
    }

    if (sub === "remove") {
      const word = interaction.options.getString("word").toLowerCase();
      bw.words = bw.words.filter(w => w !== word);
    }

    if (sub !== "view") {
      await updateGuildSettings(guildId, { "automod.badWordsCustom": bw });
      return respond(interaction, { content: "🤬 Bad words updated." });
    }

    return respond(interaction, {
      embeds: [
        new EmbedBuilder()
          .setTitle("🤬 Custom Bad Words")
          .setDescription(bw.words.join(", ") || "No words set.")
          .addFields({
            name: "Enabled",
            value: bw.enabled ? "Yes" : "No",
            inline: true,
          }),
      ],
    });
  },
};
