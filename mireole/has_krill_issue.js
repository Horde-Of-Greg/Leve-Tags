
let krillIssues = [
  "759587879541669949",
];
var hasKrillIssue = (krillIssues.includes(msg.author.username) || krillIssues.includes(msg.author.id));
if (hasKrillIssue) msg.reply("NotBasedError: " + msg.author.username + " suffers from a major krill issue, cannot proceed.");
