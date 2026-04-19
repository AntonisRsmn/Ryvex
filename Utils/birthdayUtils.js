// Utils/birthdayUtils.js
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../Data/birthdays.json');

const DEFAULT_BIRTHDAY_MESSAGES = [
  "Happy birthday, <username>! 🎉",
  "Wishing you an amazing year ahead, <username>! 🎂",
  "It's your special day, <username>! Enjoy every moment! 🥳",
  "Cheers to you, <username>! Have a fantastic birthday! 🥂",
  "Another year, another adventure! Happy birthday, <username>! 🎈",
  "May your day be filled with joy, <username>! 🎊",
  "Level up! Happy birthday, <username>! 🆙",
  "Cake, presents, and fun for <username>! 🍰🎁",
  "Hope all your wishes come true, <username>! 🌟",
  "Celebrate big, <username>! You deserve it! 🎉",
  "Sending birthday hugs to <username>! 🤗",
  "Let the party begin, <username>! 🎉🥳",
  "Wishing you laughter and happiness, <username>! 😄",
  "Happy cake day, <username>! 🍰",
  "You’re a star, <username>! Shine on! ✨",
  "Have a legendary birthday, <username>! 🏆",
  "May your year be as awesome as you, <username>! 💫",
  "Time to celebrate, <username>! 🎊",
  "Hope your day is full of surprises, <username>! 🎁",
  "Happy birthday to our amazing <username>! 🎉",
  "Wishing you a magical birthday, <username>! 🪄",
  "Let’s make today unforgettable, <username>! 🎈",
  "You’re the VIP today, <username>! 🎉",
  "Enjoy your day to the fullest, <username>! 🥳",
  "May your birthday be epic, <username>! 🚀",
  "All the best on your special day, <username>! 🎂",
  "You’re one of a kind, <username>! Happy birthday! 🌟",
  "Party time for <username>! 🎉",
  "Wishing you smiles and fun, <username>! 😁",
  "Hope your birthday is as cool as you, <username>! 😎",
  "Have a blast, <username>! 🎊",
  "Here’s to you, <username>! Cheers! 🥂",
  "May your dreams come true, <username>! ✨",
  "Happy birthday, legend <username>! 🏅",
  "You make the server brighter, <username>! 💡",
  "Let’s celebrate you, <username>! 🎉",
  "Wishing you a day full of fun, <username>! 🎈",
  "You’re the reason for the party, <username>! 🥳",
  "Hope your year is amazing, <username>! 🌠",
  "Happy birthday, awesome <username>! 🎂",
  "Enjoy your cake, <username>! 🍰",
  "Wishing you good vibes, <username>! ✌️",
  "You’re the birthday hero, <username>! 🦸",
  "Let’s get this party started, <username>! 🎉",
  "Have a sweet birthday, <username>! 🍬",
  "You’re the main event, <username>! 🎊",
  "Hope your day is full of love, <username>! ❤️",
  "Happy birthday, superstar <username>! 🌟",
  "Wishing you endless happiness, <username>! 😊",
  "You rock, <username>! Happy birthday! 🤘",
  "May your birthday be full of surprises, <username>! 🎁"
];

const DEFAULTS = {
  enabled: true,
  channel: null,
  message: null, // null means use random default
};

function getRandomBirthdayMessage(username) {
  const msg = DEFAULT_BIRTHDAY_MESSAGES[Math.floor(Math.random() * DEFAULT_BIRTHDAY_MESSAGES.length)];
  return msg.replace(/<username>/g, username);
}

function loadData() {
  if (!fs.existsSync(DATA_PATH)) return {};
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    // If corrupted, reset to empty object
    fs.writeFileSync(DATA_PATH, '{}');
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function getGuildConfig(guildId) {
  const data = loadData();
  if (!data[guildId]) data[guildId] = { config: { ...DEFAULTS }, users: {} };
  return data[guildId];
}

function setGuildConfig(guildId, config) {
  const data = loadData();
  if (!data[guildId]) data[guildId] = { config: { ...DEFAULTS }, users: {} };
  data[guildId].config = { ...data[guildId].config, ...config };
  saveData(data);
}

function setBirthday(userId, guildId, date) {
  const data = loadData();
  if (!data[guildId]) data[guildId] = { config: { ...DEFAULTS }, users: {} };
  data[guildId].users[userId] = date;
  saveData(data);
}

function getBirthday(userId, guildId, date) {
  const data = loadData();
  if (!data[guildId]) return null;
  if (userId) return data[guildId].users[userId] || null;
  if (date) {
    // Return all users with this birthday
    return Object.entries(data[guildId].users)
      .filter(([_, d]) => d === date)
      .map(([userId]) => ({ userId }));
  }
  return null;
}

function resetConfig(guildId) {
  const data = loadData();
  if (!data[guildId]) data[guildId] = { config: { ...DEFAULTS }, users: {} };
  data[guildId].config = { ...DEFAULTS };
  saveData(data);
}

function enableBirthday(guildId, enabled) {
  setGuildConfig(guildId, { enabled });
}

function getConfig(guildId) {
  return getGuildConfig(guildId).config;
}

module.exports = {
  setBirthday,
  getBirthday,
  setGuildConfig,
  getConfig,
  resetConfig,
  enableBirthday,
  getRandomBirthdayMessage,
};
