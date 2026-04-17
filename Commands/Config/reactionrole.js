const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const ReactionRole = require("../../Database/models/ReactionRole");
const { respond } = require("../../Utils/respond");

/**
 * Builds the embed + button rows for a reaction role panel.
 */
function buildPanel(panel, guild) {
  const lines = panel.roles.map(r => {
    const role = guild.roles.cache.get(r.roleId);
    return `${r.emoji} ${role ?? `<@&${r.roleId}>`}`;
  });

  const customDesc = panel.description ? panel.description + "\n\n" : "";
  const roleList = lines.length > 0 ? lines.join("\n") : "No roles configured yet.";

  const embed = new EmbedBuilder()
    .setTitle(panel.title)
    .setColor("White")
    .setDescription(customDesc + roleList)
    .setFooter({ text: "Ryvex • Reaction Roles" })
    .setTimestamp();

  // Discord allows max 5 buttons per row, max 5 rows
  const rows = [];
  for (let i = 0; i < panel.roles.length; i += 5) {
    const chunk = panel.roles.slice(i, i + 5);
    const row = new ActionRowBuilder().addComponents(
      chunk.map(r =>
        new ButtonBuilder()
          .setCustomId(`rr_${panel.messageId}_${r.roleId}`)
          .setLabel(r.label)
          .setEmoji(r.emoji)
          .setStyle(ButtonStyle.Secondary)
      )
    );
    rows.push(row);
  }

  return { embed, rows };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Manage reaction role panels.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

    /* ── CREATE ── */
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create a new reaction role panel.")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Channel to post the panel in")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("First role to add")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("emoji")
            .setDescription("Emoji for the role button (e.g. 🎮)")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("label")
            .setDescription("Button label (e.g. Gamer)")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("title")
            .setDescription("Panel title (default: Role Selection)")
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt
            .setName("message")
            .setDescription("Custom message shown above the roles")
            .setRequired(false)
        )
    )

    /* ── ADD ── */
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a role to an existing panel.")
        .addStringOption(opt =>
          opt
            .setName("message-id")
            .setDescription("Message ID of the reaction role panel")
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to add")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("emoji")
            .setDescription("Emoji for the role button")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("label")
            .setDescription("Button label")
            .setRequired(true)
        )
    )

    /* ── REMOVE ── */
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove a role from a panel.")
        .addStringOption(opt =>
          opt
            .setName("message-id")
            .setDescription("Message ID of the reaction role panel")
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to remove")
            .setRequired(true)
        )
    )

    /* ── DELETE ── */
    .addSubcommand(sub =>
      sub
        .setName("delete")
        .setDescription("Delete an entire reaction role panel.")
        .addStringOption(opt =>
          opt
            .setName("message-id")
            .setDescription("Message ID of the reaction role panel")
            .setRequired(true)
        )
    )

    /* ── LIST ── */
    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription("List all reaction role panels in this server.")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const sub = interaction.options.getSubcommand();
    const { guild } = interaction;

    try {
      /* ────────────────────────── CREATE ────────────────────────── */
      if (sub === "create") {
        const channel = interaction.options.getChannel("channel");
        const role = interaction.options.getRole("role");
        const emoji = interaction.options.getString("emoji");
        const label = interaction.options.getString("label");
        const title = interaction.options.getString("title") || "Role Selection";
        const description = interaction.options.getString("message") || null;

        // Validate bot can manage the role
        if (role.managed || role.id === guild.id) {
          return respond(interaction, {
            content: "❌ That role is managed by an integration or is @everyone.",
          });
        }

        const botMember = guild.members.me;
        if (botMember.roles.highest.position <= role.position) {
          return respond(interaction, {
            content: "❌ My highest role is below that role. I can't assign it.",
          });
        }

        // Build a temporary panel to get the embed
        const tempPanel = {
          title,
          description,
          messageId: "temp",
          roles: [{ roleId: role.id, emoji, label }],
        };
        const { embed } = buildPanel(tempPanel, guild);

        // Send the panel message first
        const panelMsg = await channel.send({ embeds: [embed] });

        // Save to DB
        const panel = await ReactionRole.create({
          guildId: guild.id,
          channelId: channel.id,
          messageId: panelMsg.id,
          title,
          description,
          roles: [{ roleId: role.id, emoji, label }],
        });

        // Re-build with real message ID and edit
        const { embed: realEmbed, rows } = buildPanel(panel, guild);
        await panelMsg.edit({ embeds: [realEmbed], components: rows });

        return respond(interaction, {
          content: `✅ Reaction role panel created in ${channel}!\nMessage ID: \`${panelMsg.id}\``,
        });
      }

      /* ────────────────────────── ADD ────────────────────────── */
      if (sub === "add") {
        const messageId = interaction.options.getString("message-id");
        const role = interaction.options.getRole("role");
        const emoji = interaction.options.getString("emoji");
        const label = interaction.options.getString("label");

        const panel = await ReactionRole.findOne({
          guildId: guild.id,
          messageId,
        });

        if (!panel) {
          return respond(interaction, {
            content: "❌ No reaction role panel found with that message ID.",
          });
        }

        if (panel.roles.length >= 25) {
          return respond(interaction, {
            content: "❌ Maximum of 25 roles per panel.",
          });
        }

        if (panel.roles.some(r => r.roleId === role.id)) {
          return respond(interaction, {
            content: "❌ That role is already on this panel.",
          });
        }

        const botMember = guild.members.me;
        if (botMember.roles.highest.position <= role.position) {
          return respond(interaction, {
            content: "❌ My highest role is below that role. I can't assign it.",
          });
        }

        panel.roles.push({ roleId: role.id, emoji, label });
        await panel.save();

        // Update the panel message
        const channel = guild.channels.cache.get(panel.channelId);
        if (channel) {
          const msg = await channel.messages.fetch(panel.messageId).catch(() => null);
          if (msg) {
            const { embed, rows } = buildPanel(panel, guild);
            await msg.edit({ embeds: [embed], components: rows });
          }
        }

        return respond(interaction, {
          content: `✅ Added ${role} with ${emoji} to the panel.`,
        });
      }

      /* ────────────────────────── REMOVE ────────────────────────── */
      if (sub === "remove") {
        const messageId = interaction.options.getString("message-id");
        const role = interaction.options.getRole("role");

        const panel = await ReactionRole.findOne({
          guildId: guild.id,
          messageId,
        });

        if (!panel) {
          return respond(interaction, {
            content: "❌ No reaction role panel found with that message ID.",
          });
        }

        const idx = panel.roles.findIndex(r => r.roleId === role.id);
        if (idx === -1) {
          return respond(interaction, {
            content: "❌ That role is not on this panel.",
          });
        }

        panel.roles.splice(idx, 1);
        await panel.save();

        // Update the panel message
        const channel = guild.channels.cache.get(panel.channelId);
        if (channel) {
          const msg = await channel.messages.fetch(panel.messageId).catch(() => null);
          if (msg) {
            const { embed, rows } = buildPanel(panel, guild);
            await msg.edit({ embeds: [embed], components: rows });
          }
        }

        return respond(interaction, {
          content: `✅ Removed ${role} from the panel.`,
        });
      }

      /* ────────────────────────── DELETE ────────────────────────── */
      if (sub === "delete") {
        const messageId = interaction.options.getString("message-id");

        const panel = await ReactionRole.findOneAndDelete({
          guildId: guild.id,
          messageId,
        });

        if (!panel) {
          return respond(interaction, {
            content: "❌ No reaction role panel found with that message ID.",
          });
        }

        // Delete the panel message
        const channel = guild.channels.cache.get(panel.channelId);
        if (channel) {
          const msg = await channel.messages.fetch(panel.messageId).catch(() => null);
          if (msg) await msg.delete().catch(() => {});
        }

        return respond(interaction, {
          content: "✅ Reaction role panel deleted.",
        });
      }

      /* ────────────────────────── LIST ────────────────────────── */
      if (sub === "list") {
        const panels = await ReactionRole.find({ guildId: guild.id });

        if (panels.length === 0) {
          return respond(interaction, {
            content: "📭 No reaction role panels in this server.",
          });
        }

        const lines = panels.map((p, i) => {
          const channel = guild.channels.cache.get(p.channelId);
          return `**${i + 1}.** ${p.title} — ${channel ?? "Unknown channel"} — \`${p.messageId}\` (${p.roles.length} roles)`;
        });

        const embed = new EmbedBuilder()
          .setTitle("🎭 Reaction Role Panels")
          .setColor("White")
          .setDescription(lines.join("\n"))
          .setFooter({ text: `${panels.length} panel(s)` })
          .setTimestamp();

        return respond(interaction, { embeds: [embed] });
      }
    } catch (error) {
      console.error("Reaction role command failed:", error);
      return respond(interaction, {
        content: "❌ Something went wrong with the reaction role command.",
      });
    }
  },
};
