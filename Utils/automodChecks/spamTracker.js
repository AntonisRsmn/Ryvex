const spamMap = new Map();

const WINDOW_MS = 5000;
const THRESHOLD = 5;

function isSpamming(userId, message) {
  const now = Date.now();

  const data = spamMap.get(userId) ?? {
    messages: [],
    first: now,
  };

  if (now - data.first > WINDOW_MS) {
    data.messages = [];
    data.first = now;
  }

  data.messages.push(message);
  spamMap.set(userId, data);

  return data.messages.length >= THRESHOLD;
}

function getSpamMessages(userId) {
  return spamMap.get(userId)?.messages ?? [];
}

function clearSpamMessages(userId) {
  spamMap.delete(userId);
}

module.exports = { isSpamming, getSpamMessages, clearSpamMessages };
