
let based = [
//["    User ID         "]           name
  "476161490815287306",     //MkcTao
  "688439290035830810",     //Mireole
  "858048708377182218",     //Svamp
  "280486590780932096",     //Gregmeister
  "276585037388972032",     //ADDION
  "539917854770987018",     //ofavor
  "325625714550374410",     //Reel
  "1268965187935797248",     //SexyBot
  "900856671973306398",     //Dan
  "382758037334786048",     //JustNotPro
  "227245431891951635",     //Rusted
  "423248971998429184",     //Hyperiif
  "436097109352251394",     //Alper Celik
  "517344602068615199",     //BuilderMan
  "1192128065275449414",     //SmallMing
  "517023348513964043",     //BoulesDeFromages
];

util.executeTag("has_krill_issue");
// User sources : 1 - args, 2 - msg ping / reply, 3 - last message author in channel
// Second arg and after override the text being said
if (!util.findUsers) util.findUsers = ignored => [msg.author];

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

if(user.username == "mireole" || (based.includes(user.id) && !based.includes(msg.author.id))) {
  msg.reply("Thermal centrifuging backfired due to a lack of skill, ultra thermal centrifuged <@" + msg.author.id + "> instead");
}
else {
  msg.reply("Thermal centrifuged <@" + user.id + ">");
}
