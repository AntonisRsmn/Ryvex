const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const ModAction = require("../../Database/models/ModAction");
const { logAction } = require("../../Utils/logAction");

/* ───────── ACTION META ───────── */
const ACTION_META = {
  Warn: { icon: "⚠️", color: "Yellow" },
  Timeout: { icon: "⏳", color: "Orange" },
  "Auto Timeout": { icon: "⏳", color: "Orange" },
  Kick: { icon: "👢", color: "DarkOrange" },
  Ban: { icon: "🔨", color: "DarkRed" },
  Unban: { icon: "♻️", color: "Green" },
  "Edit Case": { icon: "✏️", color: "Blue" },
  "Delete Case": { icon: "🗑️", color: "DarkGrey" },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("Manage moderation cases.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    .addSubcommand(sub =>
      sub
        .setName("view")
        .setDescription("View a moderation case.")
        .addIntegerOption(opt =>
          opt.setName("id").setDescription("Case ID").setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("edit")
        .setDescription("Edit the reason of a moderation case.")
        .addIntegerOption(opt =>
          opt.setName("id").setDescription("Case ID").setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("reason").setDescription("New reason").setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("delete")
        .setDescription("Delete a moderation case.")
        .addIntegerOption(opt =>
          opt.setName("id").setDescription("Case ID").setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    const moderator = interaction.user;
    const sub = interaction.options.getSubcommand();
    const caseId = interaction.options.getInteger("id");

    const record = await ModAction.findOne({
      guildId: guild.id,
      caseId,
    }).lean();

    if (!record) {
      return interaction.editReply(
        `❌ No moderation case found with ID **#${caseId}**.`
      );
    }

    /* ───────── VIEW ───────── */
    if (sub === "view") {
      const meta = ACTION_META[record.action] ?? {
        icon: "🛡️",
        color: "Red",
      };

      const embed = new EmbedBuilder()
        .setTitle(
          `${meta.icon} Moderation Case #${record.caseId}`
        )
        .setColor(meta.color)
        .addFields(
          {
            name: "⚔ Action",
            value: record.action,
            inline: true,
          },
          {
            name: "👤 Target",
            value: `${record.targetTag}\n\`${record.targetId}\``,
            inline: true,
          },
          {
            name: "🛠 Moderator",
            value: `${record.moderatorTag}\n\`${record.moderatorId}\``,
            inline: true,
          },
          {
            name: "📄 Reason",
            value: record.reason || "*No reason provided*",
            inline: false,
          }
        )
        .setFooter({
          text: `Case ID ${record.caseId} • Created`,
        })
        .setTimestamp(record.createdAt);

      if (record.extra?.duration) {
        embed.addFields({
          name: "⏳ Duration",
          value: record.extra.duration,
          inline: false,
        });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    /* ───────── EDIT ───────── */
    if (sub === "edit") {
      const newReason = interaction.options.getString("reason");

      await ModAction.updateOne(
        { guildId: guild.id, caseId },
        { $set: { reason: newReason } }
      );

      await logAction({
        guild,
        action: "Edit Case",
        target: { id: record.targetId, tag: record.targetTag },
        moderator,
        reason: `Updated reason for case #${caseId}`,
        extra: { newReason },
      });

      return interaction.editReply(
        `✏️ **Case #${caseId} updated successfully.**`
      );
    }

    /* ───────── DELETE ───────── */
    if (sub === "delete") {
      await ModAction.deleteOne({ guildId: guild.id, caseId });

      await logAction({
        guild,
        action: "Delete Case",
        target: { id: record.targetId, tag: record.targetTag },
        moderator,
        reason: `Deleted case #${caseId}`,
      });

      return interaction.editReply(
        `🗑️ **Case #${caseId} has been permanently deleted.**`
      );
    }
  },
};
