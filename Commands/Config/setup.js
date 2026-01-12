const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Step-by-step guide to configure Ryvex for your server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const pages = [
      /* ───────── PAGE 1 ───────── */
      new EmbedBuilder()
        .setTitle("🚀 Ryvex — Server Setup Guide")
        .setColor("Blue")
        .setDescription(
          [
            "Welcome to **Ryvex** 👋",
            "",
            "This guide will help you configure:",
            "• Logging",
            "• Moderation & cases",
            "• Warnings",
            "• Welcome system",
            "",
            "You only need to do this **once per server**.",
          ].join("\n")
        ),

      /* ───────── PAGE 2 ───────── */
      new EmbedBuilder()
        .setTitle("🔐 Required Permissions")
        .setColor("Orange")
        .setDescription(
          [
            "Make sure **Ryvex’s role**:",
            "• Is above roles it manages",
            "",
            "**Required permissions:**",
            "• View Audit Log",
            "• Manage Roles",
            "• Manage Channels",
            "• Moderate Members",
            "• Ban Members",
            "• Kick Members",
            "• Send Messages",
            "• Embed Links",
            "",
            "> Missing permissions will cause commands or logs to fail.",
          ].join("\n")
        ),

      /* ───────── PAGE 3 ───────── */
      new EmbedBuilder()
        .setTitle("🧾 Logging System")
        .setColor("Green")
        .setDescription(
          [
            "The logging system records important server activity.",
            "",
            "**Enable logging:**",
            "`/settings logging enable`",
            "",
            "**Set log channel:**",
            "`/settings logging channel <channel>`",
            "",
            "**Logged events:**",
            "• Member joins & leaves",
            "• Channel / role / server updates",
            "• Message edits & deletions",
            "• All moderation actions",
          ].join("\n")
        ),

      /* ───────── PAGE 4 ───────── */
      new EmbedBuilder()
        .setTitle("🛡️ Moderation & Case System")
        .setColor("Red")
        .setDescription(
          [
            "Every moderation action creates a **case**.",
            "",
            "**Examples:**",
            "• `/warn add`",
            "• `/timeout`",
            "• `/kick`",
            "• `/ban`",
            "",
            "**Each case stores:**",
            "• Case ID",
            "• Action",
            "• Target",
            "• Moderator",
            "• Reason & duration",
          ].join("\n")
        ),

      /* ───────── PAGE 5 ───────── */
      new EmbedBuilder()
        .setTitle("📂 Case Management")
        .setColor("Purple")
        .setDescription(
          [
            "**View a case:**",
            "`/case view <id>`",
            "",
            "**Edit a reason:**",
            "`/case edit <id> <new reason>`",
            "",
            "**Delete a case:**",
            "`/case delete <id>`",
            "",
            "> Deleted cases are permanently removed.",
          ].join("\n")
        ),

      /* ───────── PAGE 6 ───────── */
      new EmbedBuilder()
        .setTitle("📜 Mod Logs & History")
        .setColor("DarkRed")
        .setDescription(
          [
            "**Recent cases:**",
            "`/modlog recent`",
            "",
            "**User history:**",
            "`/modlog user <member>`",
            "",
            "Includes:",
            "• Case ID",
            "• Action",
            "• Moderator",
            "• Jump hint to `/case view`",
          ].join("\n")
        ),

      /* ───────── PAGE 7 ───────── */
      new EmbedBuilder()
        .setTitle("⚠️ Warning System")
        .setColor("Yellow")
        .setDescription(
          [
            "**Warning commands:**",
            "`/warn add <member>`",
            "`/warn count <member>`",
            "`/warn clear <member>`",
            "`/warn remove <caseId>`",
            "",
            "Warnings:",
            "• Are moderation cases",
            "• Appear in mod logs",
            "• Can be managed individually",
          ].join("\n")
        ),

      /* ───────── PAGE 8 ───────── */
      new EmbedBuilder()
        .setTitle("👋 Welcome System")
        .setColor("White")
        .setDescription(
          [
            "**Enable welcome system:**",
            "`/settings welcome enable`",
            "",
            "**Set channel:**",
            "`/settings welcome channel <channel>`",
            "",
            "**Auto role:**",
            "`/settings welcome autorole <role>`",
            "",
            "Welcome messages do **not** affect logging.",
          ].join("\n")
        ),

      /* ───────── PAGE 9 ───────── */
      new EmbedBuilder()
        .setTitle("✅ Setup Complete")
        .setColor("Green")
        .setDescription(
          [
            "Your server is now fully configured 🎉",
            "",
            "**Final checklist:**",
            "☑ Logging enabled",
            "☑ Log channels set",
            "☑ Bot role positioned correctly",
            "☑ Moderation tested",
            "",
            "Need help?",
            "• `/help`",
            "• Support server",
          ].join("\n")
        ),
    ];

    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀ Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(pages.length === 1)
    );

    const message = await interaction.editReply({
      embeds: [pages[page]],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ This setup menu isn’t for you.",
          ephemeral: true,
        });
      }

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === pages.length - 1);

      await i.update({
        embeds: [pages[page]],
        components: [row],
      });
    });
  },
};
