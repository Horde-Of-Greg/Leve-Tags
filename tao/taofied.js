
if (!util.findUsers) util.findUsers = ignored => [msg.author];

let words = http.request("https://raw.githubusercontent.com/hugsy/stuff/main/random-word/english-nouns.txt").data.split("\n");

var message = undefined;
var message1 = undefined;
if (msg.reference != null) {
    util.fetchMessages().forEach(function(msg1, index) {
        if (msg1.id == msg.reference.messageId) {
            message1 = msg1;
        }
    });
}
else {
    message1 = util.fetchMessages(msg.channel.messages.slice(-1)[0])[0];
}
message = message1.cleanContent;
let user = util.findUsers(message1.authorId)[0];

let words2 = message.split(" ");

let text = "";

words2.forEach(function (word, index) {
    if (words.includes(word.toLowerCase())) {
        text += "Tao ";
    }
    else {
        text += (word + " ");
    }
});


msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    description: text,
  },
}); 