const { MessageFlags } = require("discord.js");

/**
 * Ensures all embeds sent to Discord are valid.
 * Discord REQUIRES at least one of:
 * - description
 * - fields
 */
function sanitizeEmbeds(embeds = []) {
  return embeds.map(embedLike => {
    // Handle EmbedBuilder or raw embed object
    const embed = embedLike?.data ?? embedLike;

    const hasDescription =
      typeof embed.description === "string" && embed.description.length > 0;

    const hasFields =
      Array.isArray(embed.fields) && embed.fields.length > 0;

    // Discord rejects embeds with neither description nor fields
    if (!hasDescription && !hasFields) {
      embed.description = " ";
    }

    return embed;
  });
}

async function respond(interaction, payload) {
  try {
    const safePayload = {
      ...payload,
      embeds: payload.embeds
        ? sanitizeEmbeds(payload.embeds)
        : undefined,
      flags: payload.flags ?? MessageFlags.Ephemeral,
    };

    // Interaction was deferred → edit original reply
    if (interaction.deferred) {
      return await interaction.editReply(safePayload);
    }

    // Interaction already replied → follow up
    if (interaction.replied) {
      return await interaction.followUp(safePayload);
    }

    // Fresh interaction → reply
    return await interaction.reply(safePayload);
  } catch (err) {
    // Swallow known Discord interaction lifecycle errors
    if (
      err?.code !== 10062 && // Unknown interaction
      err?.code !== 40060 && // Interaction already acknowledged
      err?.code !== 50035    // Invalid Form Body (embed validation)
    ) {
      console.error("Respond error:", err);
    }
    return null;
  }
}

module.exports = { respond };
