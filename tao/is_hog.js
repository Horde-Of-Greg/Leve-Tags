
if (!util.findUsers) util.findUsers = ignored => [msg.author];

const hogList = http.request("http://37.27.220.107:8000/members").data.member_ids;
var user = undefined;
if (tag && tag.args) {
  var args = tag.args.split(' ');
  let users = util.findUsers(args[0]);
  if (users.length > 0) {
    user = users[0];
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

if (hogList.includes(user.id)) {
  msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    description: "I'm a real, verified, HOGger",
    color: 0x00ff00,
  },
});
} else {
  msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    description: "I'm a fake, impostor, HOGger",
    color: 0xff0000,
  },
});
}
