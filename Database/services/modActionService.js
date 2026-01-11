const ModAction = require("../models/ModAction");

async function getNextCaseId(guildId) {
  const last = await ModAction
    .findOne({ guildId })
    .sort({ caseId: -1 })
    .select("caseId");

  return last ? last.caseId + 1 : 1;
}

async function createModAction(data) {
  const caseId = await getNextCaseId(data.guildId);

  const action = await ModAction.create({
    ...data,
    caseId,
  });

  return action;
}

async function getUserModLogs(guildId, targetId, limit = 10) {
  return ModAction.find({ guildId, targetId })
    .sort({ createdAt: -1 })
    .limit(limit);
}

module.exports = {
  createModAction,
  getUserModLogs,
};
