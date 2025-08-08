

var user = undefined;
var text = 'Balls';
if (tag && tag.args) {
  var args1 = tag.args.split(' ');
  let users = util.findUsers(args[0]);
  if (users.length > 0) {
    user = users[0];
  }
  var textArray = args1.slice(1);
  if (textArray.length > 0) {
    text = textArray.join(' ');
  }
} else if (msg.mentions.repliedUser != null) {
  let users = util.findUsers(msg.mentions.repliedUser);
  if (users.length > 0) {
    user = users[0];
  }
} else {
  // Owner of last message sent in channel (i think ?)
  user = util.findUsers(
    util.fetchMessages(msg.channel.messages.slice(-1)[0])[0].authorId
  )[0];
}

const args = tag.args;
title = "";
body = "";
if (args) {
  if (args.match(/^\w+ \d{1,2}:\d{1,3}$/i)) {
    const book = args.split(" ")[0];
    const chapterVerse = args.split(" ")[1];
    const chapter = chapterVerse.split(":")[0];
    const verse = chapterVerse.split(":")[1];
    try {
      body = http.request(
        `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-asv/books/${book.toLowerCase()}/chapters/${chapter}/verses/${verse}.json`
      ).data.text;
    } catch (e) {
      msg.reply("Invalid book, chapter, or verse. Please check your input.");
    }
    title = args;
  } else {
    msg.reply("Invalid format. Please use 'Book Chapter:Verse' format.");
  }
} else {
  const request = http.request("https://bible-api.com/?random=verse").data;
  title = request.reference;
  body = request.text;
}

msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    title: `${title}`,
    description: `${body}`
  },
}); 
