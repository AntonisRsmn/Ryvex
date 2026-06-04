const GuildSettings = require("../../Database/models/GuildSettings");
const ModAction = require("../../Database/models/ModAction");
const UserLevel = require("../../Database/models/UserLevel");
const Afk = require("../../Database/models/Afk");
const Appeal = require("../../Database/models/Appeal");
const GuildRules = require("../../Database/models/GuildRules");
const ReactionRole = require("../../Database/models/ReactionRole");

module.exports = {
  name: "guildDelete",

  async execute(guild) {
    try {
      console.log(`🗑️ Bot removed from guild: ${guild.name} (${guild.id})`);

      /* ───────── CLEANUP ALL GUILD DATA ───────── */
      // This prevents data corruption and ensures a clean slate if the bot is re-added

      try {
        await GuildSettings.deleteOne({ guildId: guild.id });
        console.log(`  ✓ Deleted GuildSettings for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete GuildSettings:`, err.message);
      }

      try {
        await ModAction.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted ModActions for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete ModActions:`, err.message);
      }

      try {
        await UserLevel.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted UserLevels for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete UserLevels:`, err.message);
      }

      try {
        await Afk.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted AFK records for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete AFK records:`, err.message);
      }

      try {
        await Appeal.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted Appeals for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete Appeals:`, err.message);
      }

      try {
        await GuildRules.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted Rules for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete Rules:`, err.message);
      }

      try {
        await ReactionRole.deleteMany({ guildId: guild.id });
        console.log(`  ✓ Deleted ReactionRoles for ${guild.id}`);
      } catch (err) {
        console.error(`  ✗ Failed to delete ReactionRoles:`, err.message);
      }

      console.log(`✅ Cleanup complete for ${guild.id}`);

    } catch (error) {
      console.error(`[guildDelete] Critical error for ${guild?.name ?? "unknown"}:`, error);
    }
  },
};
