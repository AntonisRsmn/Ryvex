const suppressedMessages = new Set();

/**
 * Suppress a message delete from general logs
 */
function suppress(messageId) {
  suppressedMessages.add(messageId);

  // Auto-clean after 10s (safety)
  setTimeout(() => suppressedMessages.delete(messageId), 10_000);
}

function isSuppressed(messageId) {
  return suppressedMessages.has(messageId);
}

module.exports = {
  suppress,
  isSuppressed,
};
