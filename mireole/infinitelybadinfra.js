
util.executeTag("has_krill_issue");
// User sources : 1 - args, 2 - msg ping / reply, 3 - last message author in channel
// Second arg and after override the text being said
if (!util.findUsers) util.findUsers = ignored => [msg.author];

var user = undefined;
var text = 'My infra is so bad words can\'t even describe it';
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

if(user.username == "mireole") {
  text = 'My infra is so great words can\'t even describe it';
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
