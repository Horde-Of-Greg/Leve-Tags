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

function calculateHolyness(wordMap, message, totalWords) {
  var rawHolyness = 0;
  var words = message.toLowerCase().split(" ");
  const holynessCoefficient = (word) => {
    const rawNum = wordMap.get(word);
    return rawNum ? Math.abs(1 / Math.log10((2 * rawNum) / totalWords)) : 0;
  };

  words.forEach((word) => {
    if (wordMap.has(word)) {
      rawHolyness += holynessCoefficient(word);
    }
  });
  const firstKey = wordMap.keys().next().value;
  const perfectHolyness = words.length * holynessCoefficient(firstKey);
  const holyness = (rawHolyness / perfectHolyness) * 100;
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
message = excludeStopWords(message1.cleanContent.split(" "), stopWords).join(
  " "
);

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
    color: messageColor(holyness),
    title: "Holyness",
    description:
      "Your holyness is " +
      holyness.toLocaleString({
        maximumFractionDigits: 2,
      }) +
      "%.\n" +
      messageConclusion(holyness),
  },
});
