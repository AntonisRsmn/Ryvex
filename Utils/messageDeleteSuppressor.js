const suppressedChannels = new Set();

function suppressChannel(channelId) {
  suppressedChannels.add(channelId);

  // Auto-release after 5 seconds
  setTimeout(() => suppressedChannels.delete(channelId), 5000);
}

function isChannelSuppressed(channelId) {
  return suppressedChannels.has(channelId);
}

module.exports = {
  suppressChannel,
  isChannelSuppressed,
};
