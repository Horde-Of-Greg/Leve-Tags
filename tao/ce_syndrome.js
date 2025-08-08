
if (!util.findUsers) util.findUsers = ignored => [msg.author];

var user = undefined;
var text = 'I played CE, this is my testimony. After 2 days I developped a heavy brain tumor. After 5 days I completely stopped having independent thoughts. It has been 7 days and I am now clinically braindead, nothing can be done for me, this is the end. I am writing this using the last few bits of thoughts I have left. Goodbye.';
if (tag && tag.args) {
  var args = tag.args.split(' ');
  let users = util.findUsers(args[0]);
  if (users.length > 0) {
    user = users[0];
  }
  var textArray = args.slice(1);
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

msg.reply({
  embed: {
    author: {
      name: user.displayName,
      icon_url: user.displayAvatarURL,
    },
    description: text,
  },
});