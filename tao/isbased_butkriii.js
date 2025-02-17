let noSkillIssue = [
  //["	User ID		 "]	 	  name
  "476161490815287306", //MkcTao
  "688439290035830810", //Mireole
  "858048708377182218", //Svamp
  "800741795172450335", //Rick
  "280486590780932096", //Gregmeister
  "276585037388972032", //ADDION
  "559429571288760341", //BotAn
  "539917854770987018", //ofavor
  "325625714550374410", //Reel
  "747566720658440274", //PewsPews
  "1268965187935797248", //SexyBot
  "900856671973306398", //Dan
  "382758037334786048", //JustNotPro
  "227245431891951635", //Rusted
  "423248971998429184", //Hyperiif
  "436097109352251394", //Alper Celik
  "517344602068615199", //BuilderMan
  "1192128065275449414", //SmallMing
  "969613859625242624", //Nate
  "1093328343337795725", //Centz
  "517023348513964043", //BoulesDeFromages
  "554782382025211915", //DarkFrost
  "201370981921456128", //Exa
];

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
