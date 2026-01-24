const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const {
  getGuildSettings,
  updateGuildSettings,
} = require("../../Database/services/guildSettingsService");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("appeal")
    .setDescription("Open an appeal for a moderation action"),

  async execute(interaction) {
    const settings = await getGuildSettings(interaction.guild.id);

    if (!settings.appeals.enabled) {
      return respond(interaction, {
        content: "❌ The appeal system is currently disabled on this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const lastAction = await ModAction.findOne({
      guildId: interaction.guild.id,
      targetId: interaction.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastAction) {
      return respond(interaction, {
        content: "❌ You do not have any moderation actions to appeal.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let channel =
      settings.appeals.channelId &&
      interaction.guild.channels.cache.get(settings.appeals.channelId);

    if (!channel) {
      channel = await interaction.guild.channels.create({
        name: "appeals",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      await updateGuildSettings(interaction.guild.id, {
        "appeals.channelId": channel.id,
      });
    }

    const thread = await channel.threads.create({
      name: `appeal-${interaction.user.username}`,
      type: ChannelType.PrivateThread,
      autoArchiveDuration: 1440,
    });

    await thread.members.add(interaction.user.id).catch(() => {});
    await thread.members.add(lastAction.moderatorId).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle("📌 Appeal Opened")
      .setColor("DarkRed")
      .setDescription(
        "You’ve opened an appeal regarding a moderation action on this server."
      )
      .addFields(
        {
          name: "⚔ Action",
          value: lastAction.action,
          inline: true,
        },
        {
          name: "🆔 Case ID",
          value: `#${lastAction.caseId}`,
          inline: true,
        },
        {
          name: "🛠 Issued by",
          value: lastAction.moderatorTag,
          inline: true,
        },
        {
          name: "📅 Date",
          value: `<t:${Math.floor(
            new Date(lastAction.createdAt).getTime() / 1000
          )}:R>`,
        },
        {
          name: "📖 How to proceed",
          value:
            "• Explain **why** this action should be reviewed\n• Be respectful\n• Do **not** ping moderators",
        }
      )
      .setFooter({
        text: "Abuse of the appeal system may result in further action.",
      });

    const message = await thread.send({ embeds: [embed] });
    await message.pin();

    return respond(interaction, {
      content: "✅ Your appeal has been created.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
