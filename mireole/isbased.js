
let based = [
  "476161490815287306",
  "688439290035830810"
];
var hasKrillIssue = !(based.includes(msg.author.username) || based.includes(msg.author.id));
if (hasKrillIssue) msg.reply("NotBasedError: " + msg.author.username + " is not based enough to execute this command.");
