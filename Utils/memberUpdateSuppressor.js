const suppressions = new Map();

function suppressMemberUpdate(guildId, userId, ttl = 3000) {
  const key = `${guildId}:${userId}`;
  suppressions.set(key, Date.now() + ttl);

  setTimeout(() => suppressions.delete(key), ttl);
}

function isSuppressed(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const expires = suppressions.get(key);
  return expires && Date.now() < expires;
}

module.exports = {
  suppressMemberUpdate,
  isSuppressed,
};
