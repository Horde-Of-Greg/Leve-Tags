
util.executeTag("has_krill_issue");
// User sources : 1 - args, 2 - msg ping / reply, 3 - last message author in channel
// Second arg and after override the text being said
if (!util.findUsers) util.findUsers = ignored => [msg.author];

var user = undefined;
var args = tag.args.split(' ');
var text = 'Pex' + ' pex'.repeat(args[0] - 1);
if (tag && args.length > 1) {
  let users = util.findUsers(args[1]);
  if (users.length > 0) {
    user = users[0];
  }
  var textArray = args.slice(2);
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
