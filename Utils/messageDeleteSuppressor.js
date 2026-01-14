const suppressedDeletes = new Map();

/**
 * Suppress the next N messageDelete events in a guild
 */
function suppressNextDeletes(guildId, count) {
  if (!count || count <= 0) return;

  const current = suppressedDeletes.get(guildId) ?? 0;
  suppressedDeletes.set(guildId, current + count);

  // Safety cleanup (5s)
  setTimeout(() => {
    suppressedDeletes.delete(guildId);
  }, 5000);
}

/**
 * Consume one suppression if available
 */
function shouldSuppressDelete(guildId) {
  const remaining = suppressedDeletes.get(guildId);
  if (!remaining || remaining <= 0) return false;

  if (remaining === 1) {
    suppressedDeletes.delete(guildId);
  } else {
    suppressedDeletes.set(guildId, remaining - 1);
  }

  return true;
}

module.exports = {
  suppressNextDeletes,
  shouldSuppressDelete,
};
