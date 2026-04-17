// In-memory join tracker: guildId → [timestamps]
const joinMap = new Map();

/**
 * Record a join and return whether the raid threshold has been hit.
 * @param {string} guildId
 * @param {number} threshold  Number of joins to trigger
 * @param {number} windowSec  Time window in seconds
 * @returns {boolean} true if threshold exceeded
 */
function trackJoin(guildId, threshold, windowSec) {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;

  const joins = joinMap.get(guildId) ?? [];
  joins.push(now);

  // Prune old entries
  const recent = joins.filter(t => t > cutoff);
  joinMap.set(guildId, recent);

  return recent.length >= threshold;
}

// Active raid lockdowns: guildId → true (prevent repeated triggers)
const activeRaids = new Set();

function isRaidActive(guildId) {
  return activeRaids.has(guildId);
}

function setRaidActive(guildId) {
  activeRaids.add(guildId);

  // Auto-clear after 5 minutes
  setTimeout(() => activeRaids.delete(guildId), 5 * 60 * 1000);
}

module.exports = { trackJoin, isRaidActive, setRaidActive };
