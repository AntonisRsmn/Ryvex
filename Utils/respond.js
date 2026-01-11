const { MessageFlags } = require("discord.js");

async function respond(interaction, payload) {
  try {
    // Interaction was deferred → edit original reply
    if (interaction.deferred) {
      return await interaction.editReply(payload);
    }

    // Interaction already replied → follow up
    if (interaction.replied) {
      return await interaction.followUp({
        ...payload,
        flags: payload.flags ?? MessageFlags.Ephemeral,
      });
    }

    // Fresh interaction → reply
    return await interaction.reply({
      ...payload,
      flags: payload.flags ?? MessageFlags.Ephemeral,
    });
  } catch (err) {
    // Swallow known interaction lifecycle errors
    if (err?.code !== 10062 && err?.code !== 40060) {
      console.error("Respond error:", err);
    }
    return null;
  }
}

module.exports = { respond };
