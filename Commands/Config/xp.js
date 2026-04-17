const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const UserLevel = require("../../Database/models/UserLevel");
const { respond } = require("../../Utils/respond");
const {
  updateGuildSettings,
  getGuildSettings,
} = require("../../Database/services/guildSettingsService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Manage the leveling / XP system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    /* ── ENABLE / DISABLE ── */
    .addSubcommand(sub =>
      sub.setName("enable").setDescription("Enable the XP system")
    )
    .addSubcommand(sub =>
      sub.setName("disable").setDescription("Disable the XP system")
    )

    /* ── CHANNEL ── */
    .addSubcommand(sub =>
      sub
        .setName("channel")
        .setDescription("Set the level-up announcement channel")
        .addChannelOption(opt =>
          opt
            .setName("channel")
            .setDescription("Channel for level-up messages (leave empty for same channel)")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )

    /* ── ROLE REWARD ── */
    .addSubcommand(sub =>
      sub
        .setName("rolereward")
        .setDescription("Add a role reward at a specific level")
        .addIntegerOption(opt =>
          opt
            .setName("level")
            .setDescription("Level to grant the role at")
            .setMinValue(1)
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName("role")
            .setDescription("Role to assign")
            .setRequired(true)
        )
    )

    /* ── REMOVE ROLE REWARD ── */
    .addSubcommand(sub =>
      sub
        .setName("removerolereward")
        .setDescription("Remove a role reward")
        .addIntegerOption(opt =>
          opt
            .setName("level")
            .setDescription("Level to remove the reward from")
            .setMinValue(1)
            .setRequired(true)
        )
    )

    /* ── SET XP ── */
    .addSubcommand(sub =>
      sub
        .setName("set")
        .setDescription("Set a user's XP")
        .addUserOption(opt =>
          opt.setName("user").setDescription("Target user").setRequired(true)
        )
        .addIntegerOption(opt =>
          opt
            .setName("xp")
            .setDescription("XP amount to set")
            .setMinValue(0)
            .setRequired(true)
        )
    )

    /* ── RESET ── */
    .addSubcommand(sub =>
      sub
        .setName("reset")
        .setDescription("Reset a user's XP and level")
        .addUserOption(opt =>
          opt.setName("user").setDescription("Target user").setRequired(true)
        )
    )

    /* ── XP AMOUNT ── */
    .addSubcommand(sub =>
      sub
        .setName("amount")
        .setDescription("Set the min and max XP gained per message")
        .addIntegerOption(opt =>
          opt
            .setName("min")
            .setDescription("Minimum XP per message")
            .setMinValue(1)
            .setMaxValue(500)
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt
            .setName("max")
            .setDescription("Maximum XP per message")
            .setMinValue(1)
            .setMaxValue(500)
            .setRequired(true)
        )
    )

    /* ── COOLDOWN ── */
    .addSubcommand(sub =>
      sub
        .setName("cooldown")
        .setDescription("Set the cooldown between XP gains (in seconds)")
        .addIntegerOption(opt =>
          opt
            .setName("seconds")
            .setDescription("Cooldown in seconds (e.g. 60)")
            .setMinValue(0)
            .setMaxValue(3600)
            .setRequired(true)
        )
    )

    /* ── SETTINGS VIEW ── */
    .addSubcommand(sub =>
      sub
        .setName("settings")
        .setDescription("View current leveling configuration")
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const sub = interaction.options.getSubcommand();
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle("📊 XP System")
      .setColor("White")
      .setTimestamp();

    try {
      /* ── ENABLE ── */
      if (sub === "enable") {
        await updateGuildSettings(guild.id, { "leveling.enabled": true });
        embed.setDescription("✅ XP system **enabled**.");
        return respond(interaction, { embeds: [embed] });
      }

      /* ── DISABLE ── */
      if (sub === "disable") {
        await updateGuildSettings(guild.id, { "leveling.enabled": false });
        embed.setDescription("❌ XP system **disabled**.");
        return respond(interaction, { embeds: [embed] });
      }

      /* ── CHANNEL ── */
      if (sub === "channel") {
        const channel = interaction.options.getChannel("channel");
        const channelId = channel?.id ?? null;
        await updateGuildSettings(guild.id, { "leveling.channelId": channelId });
        embed.setDescription(
          channel
            ? `📢 Level-up messages will be sent to ${channel}.`
            : "📢 Level-up messages will be sent in the same channel."
        );
        return respond(interaction, { embeds: [embed] });
      }

      /* ── ROLE REWARD ── */
      if (sub === "rolereward") {
        const level = interaction.options.getInteger("level");
        const role = interaction.options.getRole("role");

        const settings = await getGuildSettings(guild.id);
        if (!settings) return respond(interaction, { content: "❌ Failed to load settings." });
        const rewards = settings.leveling?.roleRewards ?? [];

        // Replace existing reward at same level
        const filtered = rewards.filter(r => r.level !== level);
        filtered.push({ level, roleId: role.id });
        filtered.sort((a, b) => a.level - b.level);

        await updateGuildSettings(guild.id, { "leveling.roleRewards": filtered });

        embed.setDescription(`🎁 ${role} will be granted at level **${level}**.`);
        return respond(interaction, { embeds: [embed] });
      }

      /* ── REMOVE ROLE REWARD ── */
      if (sub === "removerolereward") {
        const level = interaction.options.getInteger("level");

        const settings = await getGuildSettings(guild.id);
        if (!settings) return respond(interaction, { content: "❌ Failed to load settings." });
        const rewards = settings.leveling?.roleRewards ?? [];
        const filtered = rewards.filter(r => r.level !== level);

        if (filtered.length === rewards.length) {
          return respond(interaction, {
            content: `❌ No role reward found at level **${level}**.`,
          });
        }

        await updateGuildSettings(guild.id, { "leveling.roleRewards": filtered });
        embed.setDescription(`🗑️ Role reward at level **${level}** removed.`);
        return respond(interaction, { embeds: [embed] });
      }

      /* ── SET XP ── */
      if (sub === "set") {
        const user = interaction.options.getUser("user");
        const xpAmount = interaction.options.getInteger("xp");

        // Recalculate level
        let level = 0;
        let remaining = xpAmount;
        while (remaining >= UserLevel.xpForLevel(level)) {
          remaining -= UserLevel.xpForLevel(level);
          level++;
        }

        await UserLevel.findOneAndUpdate(
          { guildId: guild.id, userId: user.id },
          { xp: remaining, level },
          { upsert: true }
        );

        embed.setDescription(
          `✅ Set ${user}'s level to **${level}** with **${remaining}** XP towards next level.`
        );
        return respond(interaction, { embeds: [embed] });
      }

      /* ── RESET ── */
      if (sub === "reset") {
        const user = interaction.options.getUser("user");

        await UserLevel.findOneAndUpdate(
          { guildId: guild.id, userId: user.id },
          { xp: 0, level: 0, totalMessages: 0 },
          { upsert: true }
        );

        embed.setDescription(`🗑️ Reset ${user}'s XP and level to 0.`);
        return respond(interaction, { embeds: [embed] });
      }

      /* ── AMOUNT ── */
      if (sub === "amount") {
        const min = interaction.options.getInteger("min");
        const max = interaction.options.getInteger("max");

        if (min > max) {
          return respond(interaction, {
            content: "❌ Minimum XP can't be greater than maximum XP.",
          });
        }

        await updateGuildSettings(guild.id, {
          "leveling.xpMin": min,
          "leveling.xpMax": max,
        });

        embed.setDescription(`✅ XP per message set to **${min}–${max}**.`);
        return respond(interaction, { embeds: [embed] });
      }

      /* ── COOLDOWN ── */
      if (sub === "cooldown") {
        const seconds = interaction.options.getInteger("seconds");
        const ms = seconds * 1000;

        await updateGuildSettings(guild.id, { "leveling.cooldown": ms });

        embed.setDescription(
          seconds === 0
            ? "✅ XP cooldown **disabled** — users earn XP on every message."
            : `✅ XP cooldown set to **${seconds} seconds**.`
        );
        return respond(interaction, { embeds: [embed] });
      }

      /* ── SETTINGS VIEW ── */
      if (sub === "settings") {
        const settings = await getGuildSettings(guild.id);
        const lv = settings.leveling ?? {};

        const rewardLines =
          lv.roleRewards?.length > 0
            ? lv.roleRewards
                .map(r => {
                  const role = guild.roles.cache.get(r.roleId);
                  return `Level **${r.level}** → ${role ?? `<@&${r.roleId}>`}`;
                })
                .join("\n")
            : "None";

        const announceCh = lv.channelId
          ? guild.channels.cache.get(lv.channelId) ?? "Unknown"
          : "Same channel";

        embed.setDescription(
          [
            `**Enabled:** ${lv.enabled ? "✅" : "❌"}`,
            `**Level-up channel:** ${announceCh}`,
            `**XP per message:** ${lv.xpMin ?? 15}–${lv.xpMax ?? 25}`,
            `**Cooldown:** ${((lv.cooldown ?? 60_000) / 1000).toFixed(0)}s`,
            "",
            "**Role Rewards:**",
            rewardLines,
          ].join("\n")
        );
        return respond(interaction, { embeds: [embed] });
      }
    } catch (error) {
      console.error("XP command failed:", error);
      return respond(interaction, {
        content: "❌ Something went wrong with the XP command.",
      });
    }
  },
};
