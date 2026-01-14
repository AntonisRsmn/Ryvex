const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { respond } = require("../../Utils/respond");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ppmeter")
    .setDescription("Measure your PP energy 📏😎"),

  async execute(interaction) {
    try {
      const sizes = [
        { bar: "8=D", label: "🥲 Humble beginnings" },
        { bar: "8==D", label: "😌 Respectable" },
        { bar: "8===D", label: "🙂 Solid" },
        { bar: "8====D", label: "😎 Above average" },
        { bar: "8=====D", label: "🔥 Impressive" },
        { bar: "8======D", label: "💪 Strong energy" },
        { bar: "8=======D", label: "🚀 Dangerous" },
        { bar: "8========D", label: "🧠 Unreal confidence" },
        { bar: "8=========D", label: "👑 Legendary" },
        { bar: "8==========D", label: "🛑 Government regulated" },
      ];

      const result = sizes[Math.floor(Math.random() * sizes.length)];

      const embed = new EmbedBuilder()
        .setTitle("📏 PP Meter Results")
        .setColor("White")
        .setDescription(
          [
            "Analyzing measurements…",
            "",
            `📐 **Result:**`,
            `\`\`\`${result.bar}\`\`\``,
            `🏷 **Status:** ${result.label}`,
            "",
            "> *This measurement is 100% scientific.*",
          ].join("\n")
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      return respond(interaction, {
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("PPmeter command failed:", error);

      return respond(interaction, {
        content: "❌ Failed to measure PP energy.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
