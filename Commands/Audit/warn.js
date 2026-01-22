const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const { logAction } = require("../../Utils/logAction");
const ModAction = require("../../Database/models/ModAction");

/* ───────── AUTOMOD ACTIONS ───────── */
const AUTOMOD_ACTIONS = [
  "AutoModSpam",
  "AutoModLinks",
  "AutoModBadWords",
];

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

      const manualWarns = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠ Warning Issued")
            .setColor("Yellow")
            .addFields(
              { name: "👤 Member", value: `${target}`, inline: true },
              { name: "👮 Moderator", value: `${moderator}`, inline: true },
              { name: "📝 Reason", value: reason, inline: false },
              { name: "📊 Manual Warnings", value: `${manualWarns}`, inline: true }
            )
            .setFooter({ text: "Ryvex • Moderation Action" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── CLEAR ───────── */
    if (sub === "clear") {
      const target = interaction.options.getUser("target");

      const manualWarns = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      if (!manualWarns) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("ℹ No Warnings Found")
              .setColor("Green")
              .setDescription(`👤 **Member:** ${target}\n✅ This member has no manual warnings.`)
              .setTimestamp(),
          ],
        });
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
        reason: `Cleared ${manualWarns} manual warning(s)`,
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🧹 Warnings Cleared")
            .setColor("Green")
            .addFields(
              { name: "👤 Member", value: `${target}`, inline: true },
              { name: "🧹 Cleared", value: `${manualWarns} manual warning(s)`, inline: true }
            )
            .setFooter({ text: "Ryvex • Moderation Action" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── COUNT (MANUAL + AUTOMOD) ───────── */
    if (sub === "count") {
      const target = interaction.options.getUser("target");

      const manualWarns = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: "Warn",
      });

      const automodWarns = await ModAction.countDocuments({
        guildId: guild.id,
        targetId: target.id,
        action: { $in: AUTOMOD_ACTIONS },
      });

      const total = manualWarns + automodWarns;

      if (!total) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚠ Warning Overview")
              .setColor("Green")
              .setDescription(`👤 **Member:** ${target}\n✅ No warnings on record.`)
              .setTimestamp(),
          ],
        });
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠ Warning Overview")
            .setColor("Orange")
            .setDescription(
              [
                `👤 **Member:** ${target}`,
                "",
                `⚠ **Total Warnings:** ${total}`,
                `👮 Manual Warnings: ${manualWarns}`,
                `🤖 AutoMod Warnings: ${automodWarns}`,
              ].join("\n")
            )
            .setFooter({ text: "AutoMod warnings are applied automatically" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── REMOVE (MANUAL ONLY) ───────── */
    if (sub === "remove") {
      const caseId = interaction.options.getInteger("caseid");

      const record = await ModAction.findOne({
        guildId: guild.id,
        caseId,
      });

      if (!record) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Warning Not Found")
              .setColor("Red")
              .setDescription(`No warning exists with case ID **#${caseId}**.`)
              .setTimestamp(),
          ],
        });
      }

      if (record.action !== "Warn") {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🚫 Cannot Remove AutoMod Warning")
              .setColor("Red")
              .setDescription(
                "AutoMod warnings cannot be manually removed.\n" +
                "They are managed automatically by the system."
              )
              .setTimestamp(),
          ],
        });
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
            .addFields(
              { name: "👤 Member", value: record.targetTag, inline: true },
              { name: "🧾 Case ID", value: `#${caseId}`, inline: true }
            )
            .setFooter({ text: "Ryvex • Moderation Action" })
            .setTimestamp(),
        ],
      });
    }
  },
};
