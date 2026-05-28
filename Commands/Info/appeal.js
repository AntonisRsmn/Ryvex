const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const Appeal = require("../../Database/models/Appeal");

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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const settings = await getGuildSettings(guildId);

    /* ───────── APPEALS ENABLED CHECK ───────── */
    if (!settings.appeals?.enabled) {
      return respond(interaction, {
        content: "❌ The appeal system is currently disabled on this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    /* ───────── BLOCK MULTIPLE OPEN APPEALS ───────── */
    const openAppeal = await Appeal.findOne({
      guildId,
      userId,
      status: "open",
    });

    if (openAppeal) {
      return respond(interaction, {
        content:
          "❌ You already have an **open appeal**.\nPlease wait for it to be reviewed before opening another.",
        flags: MessageFlags.Ephemeral,
      });
    }

    /* ───────── COOLDOWN CHECK ───────── */
    const lastAppeal = await Appeal.findOne({
      guildId,
      userId,
    }).sort({ openedAt: -1 });

    if (lastAppeal) {
      const cooldownMs =
        settings.appeals.cooldownMs ?? 12 * 60 * 60 * 1000;

      const elapsed = Date.now() - lastAppeal.openedAt.getTime();

      if (elapsed < cooldownMs) {
        const remainingMs = cooldownMs - elapsed;
        const hours = Math.ceil(remainingMs / (60 * 60 * 1000));

        return respond(interaction, {
          content: `⏳ You must wait **${hours} more hour(s)** before opening another appeal.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    /* ───────── FIND LAST MOD ACTION ───────── */
    const lastAction = await ModAction.findOne({
      guildId,
      targetId: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastAction) {
      return respond(interaction, {
        content: "❌ You do not have any moderation actions to appeal.",
        flags: MessageFlags.Ephemeral,
      });
    }

    /* ───────── GET / CREATE APPEALS CHANNEL ───────── */
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

      await updateGuildSettings(guildId, {
        "appeals.channelId": channel.id,
      });
    }

    /* ───────── CREATE APPEAL THREAD ───────── */
    const thread = await channel.threads.create({
      name: `appeal-${interaction.user.username}`,
      type: ChannelType.PrivateThread,
      autoArchiveDuration: 1440,
    });

    await thread.members.add(userId).catch(() => {});
    await thread.members.add(lastAction.moderatorId).catch(() => {});

    /* ───────── SAVE APPEAL TO DB ───────── */
    await Appeal.create({
      guildId,
      userId,
      caseId: lastAction.caseId,
      channelId: thread.id,
    });

    /* ───────── EMBED ───────── */
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
        text: "Abuse of the appeal system may result in further action. | Ryvex • Appeals"
      })
      .setTimestamp();

    const message = await thread.send({ embeds: [embed] });
    await message.pin();

    return respond(interaction, {
      content: "✅ Your appeal has been created.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
