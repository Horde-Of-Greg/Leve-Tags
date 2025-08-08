
if (!util.findUsers) util.findUsers = (ignored) => [msg.author];

function getMap() {
  var mapArray = [];
  for (let i = 1; i < 6; i++) {
    mapArray.push(util.fetchTag("tao_s_bwcm-" + i).body);
  }
  const fullMapStr = mapArray.join("\n");
  const wordMap = new Map();
  fullMapStr.split("\n").forEach((line) => {
    const [key, value] = line.split(" ");
    wordMap.set(key.toLowerCase(), parseInt(value));
  });
  return wordMap;
}

function calculateTotalWords(wordMap) {
  let total = 0;
  wordMap.forEach((value) => {
    total += value;
  });
  return total;
}

function isBonusWord(word) {
  const bonusWords = ["tao", "hog", "pex"];
  return bonusWords.includes(word);
}

function isBadWord(word) {
  const badWords = ["conduits", "conduit"];
  return badWords.includes(word);
}

function calculateHolyness(wordMap, message, totalWords) {
  var extraWords = 0;
  var rawHolyness = 0;
  var words = message.toLowerCase().split(" ");
  const holynessCoefficient = (word) => {
    const rawNum = wordMap.get(word);
    const bump = Math.abs(1 / -Math.log2((2 * rawNum) / 264034));
    const expo = Math.pow(1.0000093, rawNum);
    return !rawNum ? 0 : bump - expo + 1;
  };

  var holyness = 0;
  var perfectHolyness = 0;
  words.forEach((word) => {
    if (isBonusWord(word)) {
      extraWords += 1;
    } else if (isBadWord(word)) {
      extraWords -= 1;
    } else if (wordMap.has(word)) {
      rawHolyness += holynessCoefficient(word);
    }
  });
  if (extraWords > 0) {
    holyness = 100;
  } else if (extraWords === 0) {
    const firstKey = wordMap.keys().next().value;
    perfectHolyness = words.length * holynessCoefficient(firstKey);
    holyness = (rawHolyness / perfectHolyness) * 100;
  } else {
    holyness = 0;
  }

  if (holyness > 100) {
    return 100;
  }
  if (holyness < 0) {
    return 0;
  }
  if (isNaN(holyness)) {
    return 0;
  }
  if (holyness == Infinity) {
    return 0;
  }
  if (holyness == -Infinity) {
    return 0;
  }
  if (holyness == null) {
    return 0;
  }
  if (holyness == undefined) {
    return 0;
  }
  return holyness;
}

function excludeStopWords(message, stopWords) {
  return message.filter((word) => !stopWords.includes(word));
}

var message = undefined;
var message1 = undefined;
if (msg.reference != null) {
  util.fetchMessages().forEach(function (msg1, index) {
    if (msg1.id == msg.reference.messageId) {
      message1 = msg1;
    }
  });
} else {
  message1 = util.fetchMessages(msg.channel.messages.slice(-1)[0])[0];
}
const stopWords = util.fetchTag("tao_s_bcsw").body.split("\n");
var message2 = undefined;
try {
  message2 = message1.content;
} catch (e) {
  msg.reply(
    "Error: The message is too old or has been deleted. \n -Sincerely, God"
  );
}
if (message2 == undefined) {
  msg.reply(
    "Error: The message is too old or has been deleted. \n -Sincerely, God"
  );
}
var user = undefined;
try {
  user = util.findUsers(message1.authorId)[0];
} catch (e) {
  msg.reply(
    "Error: The message is too old or has been deleted. \n -Sincerely, God"
  );
}

message = excludeStopWords(
  message2.toLowerCase().replace(/\W+/g, " ").replace(/\s+/g, " ").split(" "),
  stopWords
).join(" ");

const wordMap = getMap();
const totalWords = calculateTotalWords(wordMap);
const holyness = calculateHolyness(wordMap, message, totalWords);

const messageColor = (holyness) => {
  if (holyness > 80) {
    return 0x02fc06;
  } else if (holyness > 50) {
    return 0xbdfc02;
  } else if (holyness > 25) {
    return 0xfcb902;
  } else {
    return 0xfc0a02;
  }
};

const messageConclusion = (holyness) => {
  if (holyness >= 100) {
    return "Perfectly holy. You cheated.";
  } else if (holyness > 80) {
    return "Holy. You are a good person. Continue writing like this.";
  } else if (holyness > 50) {
    return "Somewhat holy. You are a good person.";
  } else if (holyness > 25) {
    return "Somewhat unholy. You are a bad person.";
  } else {
    return "Damnation. Get out of this server. You will burn in hell.";
  }
};

msg.reply({
  embed: {
    author: {
      name: "God",
      icon_url:
        "https://cdn.discordapp.com/attachments/1266376637876928696/1362133906786357589/cat.png?ex=6801498e&is=67fff80e&hm=1ec6784bfdafb2856ccccf904b58e540340d1efc5e3f9229e7158ea6719dcc9b&",
    },
    color: messageColor(holyness),
    title: `${user.displayName}'s Holyness`,
    description:
      `${user.displayName}'s holyness is ` +
      holyness.toFixed(2) +
      "%.\n" +
      messageConclusion(holyness) +
      "\n\n" +
      "The message I read was:\n" +
      message1.cleanContent,
  },
});

