
if (!util.findUsers) util.findUsers = ignored => [msg.author];

var user = undefined;
var text = 'Mierole is the COOLEST person ever like if I could meet him irl I would be so honored. He should win the Nobel prize of peace because of how cool he is!! And I feel like mierole should like get all the worlds funds because he so cool and he should be the owner of this world. Him and gregmeister aka zorbatron should rule the world together and they should bring peace to this world and enforce gregtech into all schools! And if mierole was elected as president of the US all problems would be fixed. I don’t know but I just love mierole. Mierole is so cool. I love mierole';
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
