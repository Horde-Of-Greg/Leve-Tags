
let noSkillIssue = http.request("http://37.27.220.107:8000/members").data.member_ids; // HOG API

let blacklisted = [];

var isEpic = noSkillIssue.includes(msg.author.id);
var isBlacklisted = blacklisted.includes(msg.author.id);

// Give users a 0.00001% chance of rolling a special krill
var doEpicKrill = Math.random() < 0.00001 ? true : isEpic;

// Makes the result be an epic fail if the user is blacklisted
// or with a 0.05% chance if the user isn't whitelisted
var doEpicFail = isEpic ? false : Math.random() < 0.05 || isBlacklisted;

//Outputs
if (doEpicFail) {
  msg.reply("LOL Epic Fail");
}

if (doEpicKrill) {
  util.executeTag("special_kriii");
} else {
  msg.reply(
    "Vanilla krill LOL laugh at this user https://cdn.discordapp.com/attachments/954620685848825886/1234949802752737340/krill-issue.png?ex=66329821&is=663146a1&hm=8a10ec88516b82aa285335c214782b699c01a55dec7247326381e1e2e792828e&"
  );
}
