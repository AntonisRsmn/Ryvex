const suppressed = new Set();

function suppress(targetId, duration = 5000) {
  suppressed.add(targetId);
  setTimeout(() => suppressed.delete(targetId), duration);
}

function isSuppressed(targetId) {
  return suppressed.has(targetId);
}

module.exports = { suppress, isSuppressed };
