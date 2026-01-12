const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");
const ModAction = require("../../Database/models/ModAction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Manage warnings for members.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Warn a member.")
        .addUserOption(opt =>
          opt.setName("target").setDescription("Member to warn").setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("reason").setDescription("Reason for the warning")
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("clear")
        .setDescription("Clear all warnings from a member.")
        .addUserOption(opt =>
          opt.setName("target").setDescription("Member").setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("count")
        .setDescription("View how many warnings a member has.")
        .addUserOption(opt =>
          opt.setName("target").setDescription("Member").setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove a specific warning by case ID.")
        .addIntegerOption(opt =>
          opt.setName("caseid").setDescription("Warning case ID").setRequired(true)
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const { guild, user: moderator } = interaction;
    const sub = interaction.options.getSubcommand();

    /* ───────── ADD ───────── */
    if (sub === "add") {
      const target = interaction.options.getUser("target");
      const reason =
        interaction.options.getString("reason") || "No reason provided";

      await logAction({
        guild,
        action: "Warn",
        target,
        moderator,
        reason,
      });

      const warnCount = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠ Warning Issued")
            .setColor("Yellow")
            .setDescription(
              [
                `👤 **Member:** ${target}`,
                `📄 **Reason:** ${reason}`,
                `⚠ **Total Warnings:** ${warnCount}`,
              ].join("\n")
            )
            .setTimestamp(),
        ],
      });
    }

    /* ───────── CLEAR ───────── */
    if (sub === "clear") {
      const target = interaction.options.getUser("target");

      const warnCount = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      if (!warnCount) {
        return interaction.editReply(
          `ℹ **${target.tag}** has no warnings.`
        );
      }

      await ModAction.deleteMany({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      await logAction({
        guild,
        action: "Clear Warnings",
        target,
        moderator,
        reason: `Cleared ${warnCount} warning(s)`,
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🧹 Warnings Cleared")
            .setColor("Green")
            .setDescription(
              `👤 **Member:** ${target}\n🧹 **Warnings Cleared:** ${warnCount}`
            )
            .setTimestamp(),
        ],
      });
    }

    /* ───────── COUNT (WITH CASE LINKS) ───────── */
    if (sub === "count") {
      const target = interaction.options.getUser("target");

      const warns = await ModAction.find({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!warns.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚠ Warning Count")
              .setColor("Green")
              .setDescription(`👤 **Member:** ${target}\n✅ No warnings found.`)
              .setTimestamp(),
          ],
        });
      }

      const recent = warns.slice(0, 5);

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠ Warning Count")
            .setColor("Orange")
            .setDescription(
              [
                `👤 **Member:** ${target}`,
                `⚠ **Total Warnings:** ${warns.length}`,
                "",
                "**Recent Warning Cases:**",
                ...recent.map(
                  w => `• **#${w.caseId}** → \`/case view ${w.caseId}\``
                ),
              ].join("\n")
            )
            .setFooter({ text: "Use /case view <id> for full details" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── REMOVE ───────── */
    if (sub === "remove") {
      const caseId = interaction.options.getInteger("caseid");

      const record = await ModAction.findOne({
        guildId: guild.id,
        caseId,
        action: "Warn",
      });

      if (!record) {
        return interaction.editReply(
          `❌ No warning found with case ID **#${caseId}**.`
        );
      }

      await record.deleteOne();

      await logAction({
        guild,
        action: "Remove Warning",
        target: { id: record.targetId, tag: record.targetTag },
        moderator,
        reason: `Removed warning case #${caseId}`,
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑 Warning Removed")
            .setColor("Green")
            .setDescription(
              `🗑 **Removed warning case #${caseId}**\n👤 **Member:** ${record.targetTag}`
            )
            .setTimestamp(),
        ],
      });
    }
  },
};
