// This script calculates which rolls a user can get by running kriii and the probabilities of each roll.
let specialProbabilities = {
  god: 0.05,
  superBased: 0.25,
  proHacker: 0.4,
  cat: 0.75,
  scary: 0.75,
  baby: 0.75,
  cheese: 0.75,
  cringe: 0.75,
  megaCringe: 0.75,
  nothingToSee: 0.99,
};

let basedProbabilities = {
  chroma: 0.00001,
  lgbt: 0.02,
  evil: 0.07,
  pleading: 0.13,
  waltuh: 0.145,
  microsoft: 0.16,
};

let generalProbabilities = {
  epicFail: 0.05,
  epicKrillNormal: 0.00001,
};

let generalLists = {
  blacklist: [],
  noSkillIssue: [
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
  ],
};

let specialLists = {
  baby: ["858048708377182218"], //Svamp
  cat: ["280486590780932096"], //Gregmeister
  cheese: ["517023348513964043"], //BoulesDeFromages
  cringe: ["1093328343337795725"], //Centz
  god: ["476161490815287306"], //MkcTao
  megaCringe: ["969613859625242624"], //Nate
  nothingToSee: ["201370981921456128"], //Exa
  scary: ["227245431891951635"], //Rusted
  proHacker: [
    "688439290035830810", //Mireole
    "1192128065275449414", //SmallMing
    "280486590780932096", //Gregmeister
  ],
  superBased: [
    "476161490815287306", //MkcTao
    "688439290035830810", //Mireole
    "280486590780932096", //Gregmeister
    "539917854770987018", //ofavor
  ],
};

// Find the user's lists
var userLists = {};

function findUserLists(listType) {
  for (const listName in listType) {
    if (listType[listName].includes(msg.author.id)) {
      userLists[listName] = true;
    } else {
      userLists[listName] = false;
    }
  }
}

findUserLists(generalLists);

if (userLists["noSkillIssue"]) {
  findUserLists(specialLists);
}

// Construct the message
if (userLists["blacklist"]) {
  msg.reply("You will always get an epic fail. Skill issue.");
}

var message = "Here are your possible rolls: ";
var workingProbability = 1;

function updateWorkingProbability(probabilitySet, key) {
  workingProbability = workingProbability * (1 - probabilitySet[key]);
}

if (!userLists["noSkillIssue"]) {
  updateWorkingProbability(generalProbabilities, "epicKrillNormal");
  message += "\n epicFail (" + workingProbability * 100 + "%)";
}

for (const key in specialProbabilities) {
  if (userLists[key]) {
    workingProbability = workingProbability * specialProbabilities[key];
    message += "\n " + key + " (" + workingProbability * 100 + "%)";
    updateWorkingProbability(specialProbabilities, key);
  }
}

msg.reply(message);
