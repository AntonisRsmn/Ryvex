const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const GuildRules = require("../../Database/models/GuildRules");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules-admin")
    .setDescription("Manage server rules")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a new rule")
        .addStringOption(o =>
          o.setName("title").setDescription("Rule title").setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("description")
            .setDescription("Rule description")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("edit")
        .setDescription("Edit an existing rule")
        .addIntegerOption(o =>
          o.setName("id").setDescription("Rule number").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("title").setDescription("New title")
        )
        .addStringOption(o =>
          o.setName("description").setDescription("New description")
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove a rule")
        .addIntegerOption(o =>
          o.setName("id").setDescription("Rule number").setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName("preview").setDescription("Preview current rules")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    const data =
      (await GuildRules.findOne({ guildId })) ??
      (await GuildRules.create({ guildId, rules: [] }));

    /* ───────── ADD ───────── */
    if (sub === "add") {
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");

      const nextId =
        data.rules.length > 0
          ? Math.max(...data.rules.map(r => r.id)) + 1
          : 1;

      data.rules.push({ id: nextId, title, description });
      await data.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Rule Added")
            .setColor("Green")
            .setDescription(
              `**Rule #${nextId} created successfully**\n\n` +
              `**${title}**\n${description}`
            )
            .setFooter({ text: "Use /rules-admin preview to review all rules" })
            .setTimestamp(),
        ],
      });
    }

    /* ───────── EDIT ───────── */
    if (sub === "edit") {
      const id = interaction.options.getInteger("id");
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");

      const rule = data.rules.find(r => r.id === id);
      if (!rule) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Rule Not Found")
              .setColor("Red")
              .setDescription(`No rule with ID **${id}** exists.`),
          ],
        });
      }

      if (title) rule.title = title;
      if (description) rule.description = description;
      await data.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✏️ Rule Updated")
            .setColor("Orange")
            .setDescription(
              `**Rule #${rule.id} updated**\n\n` +
              `**${rule.title}**\n${rule.description}`
            )
            .setTimestamp(),
        ],
      });
    }

    /* ───────── REMOVE ───────── */
    if (sub === "remove") {
      const id = interaction.options.getInteger("id");

      const before = data.rules.length;
      data.rules = data.rules.filter(r => r.id !== id);

      if (data.rules.length === before) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Rule Not Found")
              .setColor("Red")
              .setDescription(`No rule with ID **${id}** exists.`),
          ],
        });
      }

      await data.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑 Rule Removed")
            .setColor("Red")
            .setDescription(`Rule **#${id}** has been permanently removed.`)
            .setTimestamp(),
        ],
      });
    }

    /* ───────── PREVIEW ───────── */
    if (sub === "preview") {
      if (!data.rules.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("📜 Rules Preview")
              .setColor("Orange")
              .setDescription("No rules configured."),
          ],
        });
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📜 Rules Preview")
            .setColor("Blue")
            .setDescription(
              data.rules
                .sort((a, b) => a.id - b.id)
                .map(
                  r =>
                    `**${r.id}. ${r.title}**\n${r.description}`
                )
                .join("\n\n")
            )
            .setFooter({
              text: "This is exactly how members see /rules",
            })
            .setTimestamp(),
        ],
      });
    }
  },
};
