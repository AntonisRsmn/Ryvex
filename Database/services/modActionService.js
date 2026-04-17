const ModAction = require("../models/ModAction");

async function getNextCaseId(guildId) {
  try {
  const last = await ModAction
    .findOne({ guildId })
    .sort({ caseId: -1 })
    .select("caseId");

  return last ? last.caseId + 1 : 1;
  } catch (err) {
    console.error("[getNextCaseId]", err);
    return -1;
  }
}

async function createModAction(data) {
  try {
  const caseId = await getNextCaseId(data.guildId);

  const action = await ModAction.create({
    ...data,
    caseId,
  });

  return action;
  } catch (err) {
    console.error("[createModAction]", err);
    return null;
  }
}

async function getUserModLogs(guildId, targetId, limit = 10) {
  try {
  return ModAction.find({ guildId, targetId })
    .sort({ createdAt: -1 })
    .limit(limit);
  } catch (err) {
    console.error("[getUserModLogs]", err);
    return [];
  }
}

module.exports = {
  createModAction,
  getUserModLogs,
};
