
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
message = message1.cleanContent;
let user = util.findUsers(message1.authorId)[0];

function multiplyLetter(letter, chanceToMultiply) {
  let text = letter;
  if (Math.random() < chanceToMultiply) {
    text += letter.repeat(Math.floor(Math.random() * 3) + 1);
  }
  return text;
}

let letters = message.split("");

let text = "";
letters.forEach(function (letter, index) {
  if (letter.match(/[rl]/i)) {
    text += "w";
  } else if (letter === "o") {
    if (index != 0) {
      if (letters[index - 1].match(/[nm]/i)) {
        text += "yo";
      } else {
        text += "o";
      }
    } else {
      text += "o";
    }
  } else if (letter === " ") {
    if (Math.random() < 0.05) {
      text += " UwU ";
    } else if (Math.random() < 0.05) {
      text += " OwO ";
    } else {
      text += " ";
    }
  } else {
    text += letter;
  }
});

words = text.split(" ");
lastWordLetters = words[words.length - 1].split("");
words.pop();
lastWordLetters.forEach(function (letter, index) {
  if (letter.match(/[aeiouy]/i)) {
    lastWordLetters[index] = multiplyLetter(letter, 1);
  }
});
words.forEach(function (word, index) {
  if (word !== "UwU" && word !== "OwO" && word.length > 2) {
    letters = word.split("");
    letters.forEach(function (letter, index) {
      if (letter.match(/[aeiouy]/i)) {
        letters[index] = multiplyLetter(letter, 0.1);
      }
    });
    words[index] = letters.join("");
  }
});

words.push(lastWordLetters.join(""));
text = words.join(" ");

text = text.replace(/[,.]/g, "");

text = text + "~";

const toReply = (user.id === "476161490815287306") ? "Doesn't work on me, nerd" : text
msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    description: toReply,
  },
});
