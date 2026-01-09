const pollCommand = require("../../Commands/Info/poll");

module.exports = {
  name: "messageReactionAdd",

  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (!pollCommand.pollMessages.has(reaction.message.id)) return;

    if (!["✅", "❌"].includes(reaction.emoji.name)) return;

    const other = reaction.emoji.name === "✅" ? "❌" : "✅";

    const otherReaction = reaction.message.reactions.cache.get(other);
    if (otherReaction?.users.cache.has(user.id)) {
      await otherReaction.users.remove(user.id).catch(() => {});
    }
  },
};
