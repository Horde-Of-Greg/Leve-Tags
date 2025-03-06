// Essential Logic
function getTagBody(tagName) {
  // This returns the body of a tag without the backticks for .md formatting.
  var tag = util.fetchTag(tagName);
  var tagBody = tag.body;
  tagBody = tagBody.replace(/`/g, "");
  return tagBody;
}

function getAllOredics() {
  const validOredicTag = /^nfu_oredic_[a-z-]+_\d$/;
  // A oredic tag must follow this format: nfu_oredic_<stepName>_<minorVerNumberNomi>
  return util.dumpTags().filter((tag) => validOredicTag.test(tag));
}

function getOredicTag(stepName, version) {
  return `nfu_oredic_${stepName}_${version}`;
}

function getAllSteps(oredics, version) {
  let output = [];
  for (let oredic of oredics) {
    if (oredic.includes(version)) {
      output.push(oredic.split("_")[2]);
    }
  }
  return output;
}

function getCurrentMinVer() {
  return util.fetchTag("tao_storage_curr_nomi_version").body;
}

function isExistingOredic(stepName, version) {
  if (getAllSteps(getAllOredics(), version).includes(stepName)) {
    return true;
  }
  return false;
}

// Sending logic
function sendAllOredics(oredics, version) {
  let output = "";
  for (let step of getAllSteps(oredics, version)) {
    output += getTagBody(getOredicTag(step, version)) + "\n";
  }
  msg.reply(output);
}

function sendOredic(step, version) {
  msg.reply(getTagBody(getOredicTag(step, version)));
}

function sendAllSteps(oredics, version) {
  msg.reply(getAllSteps(oredics, version).join(", "));
}

function sendIsAStep(step, version) {
  if (isExistingOredic(step, version)) {
    msg.reply("Yes, this step exists.");
  } else {
    msg.reply("No, this step does not exist.");
  }
}

function sendHelpString() {
  msg.reply(
    "Usage: nfu_oredic <arg>\n" +
      "arg:\n" +
      "  - all: returns all the oredics\n" +
      "  - steps: returns all the that you can call\n" +
      "  - <step>: returns the oredic for the given step\n" +
      "  - is_step <step>: returns whether the step exists\n"
  );
}

// Main functions
function determineLogic(input, version) {
  switch (input[0]) {
    case "all" | "a":
      sendAllOredics(getAllOredics(), version);
      break;
    case "steps" | "s":
      sendAllSteps(getAllOredics(), version);
      break;
    case /is_step .+/:
      sendIsAStep(input[1], version);
      break;
    case isExistingOredic(input[0], version):
      sendOredic(input[0], version);
      break;
    case "help" | "h":
      sendHelpString();
      break;
    default:
      msg.reply(
        "Invalid argument. Please use `nfu_oredic help` for more information."
      );
      break;
  }
}

function main() {
  // Fetch the args and the current version
  const input = util.args;
  const version = getCurrentMinVer();
  // If no input is given, return all oredics
  if (input == undefined) {
    sendAllOredics(getAllOredics(), version);
  }
  // If input is given, determine the logic
  determineLogic(input, version);
}

main();
