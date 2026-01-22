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
    .setName("automod-roles")
    .setDescription("Manage AutoMod role bypass rules")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a role that bypasses AutoMod")
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to bypass AutoMod")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove a role from AutoMod bypass")
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to remove from bypass")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("view")
        .setDescription("View roles that bypass AutoMod")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const settings = await getGuildSettings(interaction.guild.id);

    if (!Array.isArray(settings.automod.rolesBypass)) {
      settings.automod.rolesBypass = [];
    }

    const bypass = settings.automod.rolesBypass;
    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      const role = interaction.options.getRole("role");
      if (!bypass.includes(role.id)) bypass.push(role.id);
    }

    if (sub === "remove") {
      const role = interaction.options.getRole("role");
      settings.automod.rolesBypass = bypass.filter(id => id !== role.id);
    }

    await updateGuildSettings(interaction.guild.id, {
      "automod.rolesBypass": settings.automod.rolesBypass,
    });

    if (sub !== "view") {
      return respond(interaction, {
        content: "✅ AutoMod role bypass updated.",
      });
    }

    const list =
      settings.automod.rolesBypass.length === 0
        ? "No roles bypass AutoMod."
        : settings.automod.rolesBypass
            .map(id => interaction.guild.roles.cache.get(id))
            .filter(Boolean)
            .join("\n");

    return respond(interaction, {
      embeds: [
        new EmbedBuilder()
          .setTitle("🧩 AutoMod Role Bypass")
          .setDescription(list)
          .setColor("Blue")
          .setTimestamp(),
      ],
    });
  },
};
