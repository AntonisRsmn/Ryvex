const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send a custom embed to a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    // Required options first
    .addStringOption(opt =>
      opt.setName("title")
        .setDescription("Embed title.")
        .setMaxLength(256)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("description")
        .setDescription("Embed description.")
        .setMaxLength(4096)
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("Channel to send the embed to.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    // Optional options after required
    .addStringOption(opt =>
      opt.setName("color")
        .setDescription("Embed color (hex or name, e.g. #0099ff or Red)")
        .setMaxLength(32)
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("image")
        .setDescription("Embed image URL (optional)")
        .setMaxLength(1024)
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("thumbnail")
        .setDescription("Embed thumbnail URL (optional)")
        .setMaxLength(1024)
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("footer")
        .setDescription("Footer text (optional)")
        .setMaxLength(2048)
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName("author")
        .setDescription("Show author as the user who sent the embed (optional)")
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName("url")
        .setDescription("Embed URL (optional)")
        .setMaxLength(1024)
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName("timestamp")
        .setDescription("Add current timestamp (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const channel = interaction.options.getChannel("channel");
    let color = interaction.options.getString("color");
    const image = interaction.options.getString("image");
    const thumbnail = interaction.options.getString("thumbnail");
    const footer = interaction.options.getString("footer");
    const author = interaction.options.getBoolean("author");
    const url = interaction.options.getString("url");
    const timestamp = interaction.options.getBoolean("timestamp");

    // Support common color names
    const colorNames = {
      white: "#ffffff",
      black: "#000000",
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0099ff",
      yellow: "#ffff00",
      orange: "#ffa500",
      purple: "#800080",
      pink: "#ff69b4",
      cyan: "#00ffff",
      magenta: "#ff00ff",
      gray: "#808080",
      grey: "#808080",
      brown: "#a52a2a",
      gold: "#ffd700",
      silver: "#c0c0c0",
      navy: "#000080",
      teal: "#008080",
      lime: "#00ff00",
      maroon: "#800000",
      olive: "#808000",
      aqua: "#00ffff",
      fuchsia: "#ff00ff"
    };
    if (!color) {
      color = "#ffffff"; // Default to white
    } else {
      const lower = color.toLowerCase();
      if (colorNames[lower]) {
        color = colorNames[lower];
      } else {
        // Accept #RRGGBB or RRGGBB
        const hexPattern = /^#?([a-fA-F0-9]{6})$/;
        const hexMatch = color.match(hexPattern);
        if (hexMatch) {
          color = `#${hexMatch[1]}`;
        } else {
          color = "#ffffff";
        }
      }
    }

    // Build the embed
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color);
    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });
    if (author) {
      const user = interaction.user;
      embed.setFooter({
        text: user.globalName || user.username,
        iconURL: user.displayAvatarURL ? user.displayAvatarURL() : undefined
      });
    }
    if (url) {
      try {
        // Only allow http/https and valid URLs
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          embed.setURL(url);
        }
      } catch (e) {
        // Ignore invalid URL, do not set
      }
    }
    if (timestamp) embed.setTimestamp();

    // Try to send the embed to the chosen channel
    try {
      await channel.send({ embeds: [embed] });
      return respond(interaction, {
        content: `✅ Embed sent to ${channel}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      return respond(interaction, {
        content: `❌ Failed to send embed: ${err.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
