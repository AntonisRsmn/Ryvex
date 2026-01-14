const suppressions = new Map();

function suppressMemberRemove(guildId, userId, ttl = 5000) {
  const key = `${guildId}:${userId}`;
  suppressions.set(key, Date.now() + ttl);

  setTimeout(() => suppressions.delete(key), ttl);
}

function isMemberRemoveSuppressed(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const expires = suppressions.get(key);
  return expires && Date.now() < expires;
}

module.exports = {
  suppressMemberRemove,
  isMemberRemoveSuppressed,
};
