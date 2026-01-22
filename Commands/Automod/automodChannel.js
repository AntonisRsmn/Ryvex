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

function toggle(arr, id) {
  return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod-channel")
    .setDescription("Configure AutoMod channel rules")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(s => s.setName("ignore").setDescription("Toggle AutoMod ignore"))
    .addSubcommand(s => s.setName("spam").setDescription("Toggle spam filter"))
    .addSubcommand(s => s.setName("links").setDescription("Toggle link blocking"))
    .addSubcommand(s => s.setName("badwords").setDescription("Toggle bad-word filter"))
    .addSubcommand(s => s.setName("view").setDescription("View channel rules")),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { guild, channel } = interaction;
    const sub = interaction.options.getSubcommand();

    const settings = await getGuildSettings(guild.id);
    const ch = settings.automod.channels;

    if (sub === "ignore") ch.ignored = toggle(ch.ignored, channel.id);
    if (sub === "spam") ch.spamDisabled = toggle(ch.spamDisabled, channel.id);
    if (sub === "links") ch.linksAllowed = toggle(ch.linksAllowed, channel.id);
    if (sub === "badwords") ch.badWordsDisabled = toggle(ch.badWordsDisabled, channel.id);

    if (sub !== "view") {
      await updateGuildSettings(guild.id, { "automod.channels": ch });
      return respond(interaction, { content: "✅ Channel rule updated." });
    }

    return respond(interaction, {
      embeds: [
        new EmbedBuilder()
          .setTitle("📍 AutoMod Channel Rules")
          .setDescription(
            [
              `Ignored: ${ch.ignored.length}`,
              `Spam Disabled: ${ch.spamDisabled.length}`,
              `Links Allowed: ${ch.linksAllowed.length}`,
              `BadWords Disabled: ${ch.badWordsDisabled.length}`,
            ].join("\n")
          )
          .setColor("Blue"),
      ],
    });
  },
};
