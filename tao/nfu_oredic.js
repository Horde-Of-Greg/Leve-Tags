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
  return util.fetchTag("tao_storage_curr_nomi_version").body.split(".")[1];
}

function formattedAnswer(body) {
  title = body.split("\n")[0];
  body = body.split("\n").slice(1).join("\n");
  const codeBlock = "```";
  return `## ${title}\n${codeBlock}\n${body}\n${codeBlock}`;
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
    output += formattedAnswer(getTagBody(getOredicTag(step, version))) + "\n";
  }
  msg.reply(output);
}

function sendOredic(step, version) {
  msg.reply(formattedAnswer(getTagBody(getOredicTag(step, version))));
}

function sendAllSteps(oredics, version) {
  output = "Here are all the steps you can call:\n";
  output += getAllSteps(oredics, version).join("\n");
  msg.reply(output);
}

function sendIsAStep(step, version) {
  if (isExistingOredic(step, version)) {
    msg.reply("Yes, this step exists.");
  } else {
    msg.reply("No, this step does not exist.");
  }
}

function sendAddString() {
  msg.reply(
    "To add a new oredic, you need to create a new tag with the following format:\n" +
      "  - Tag name: nfu_oredic_<stepName>_<minorVerNumberNomi>\n" +
      "  - Tag body: \n" +
      "    <title>\n" +
      "    <content>\n" +
      "\n" +
      "  - Example: \n" +
      "  tag name : nfu_oredic_good-title-with-dashes-for-spaces_6\n" +
      "  tag body : \n" +
      "    Title: The title of the oredic\n" +
      "    Content: The actual oredic string\n" +
      "  version of Nomi this is valid for : 1.6, 1.6.1\n" +
      "\n" +
      "  - Example 2: \n" +
      "  tag name : nfu_oredic_crushing-space-ores_7\n" +
      "  tag body : \n" +
      "    Title: Space Ore Crush\n" +
      "    Content: The oredic string for crushing space ores\n" +
      "  version of Nomi this is valid for : 1.7, 1.7.1, 1.7.2, 1.7.3, 1.7.4"
  );
}

function sendHelpString() {
  msg.reply(
    "Usage: nfu_oredic <arg>\n" +
      "arg:\n" +
      "  - all: returns all the oredics\n" +
      "  - steps: returns all the that you can call\n" +
      "  - <step>: returns the oredic for the given step\n" +
      "  - is_step <step>: returns whether the step exists\n" +
      "  - add : explains how to add a new oredic"
  );
}

function sendDebugString() {
  output = "";
  output += "Current version: " + getCurrentMinVer() + "\n";
  output += "Received input: " + tag.args + "\n";
  output +=
    "Read from version tag: " +
    util.fetchTag("tao_storage_curr_nomi_version").body +
    "\n";
  output += "All oredics: " + getAllOredics() + "\n";
  output += "All steps: " + getAllSteps(getAllOredics(), getCurrentMinVer());

  if (!output.trim()) output = "Leveret is working but debug output is empty.";
  msg.reply(output);
}

// Main functions
function determineLogic(input, version) {
  const command = input[0];

  if (command === "all" || command === "a") {
    sendAllOredics(getAllOredics(), version);
  } else if (command === "steps" || command === "s") {
    sendAllSteps(getAllOredics(), version);
  } else if (command.startsWith("is_step")) {
    sendIsAStep(input[1], version);
  } else if (isExistingOredic(command, version)) {
    sendOredic(command, version);
  } else if (command === "help" || command === "h") {
    sendHelpString();
  } else if (command === "debug" || command === "d") {
    sendDebugString();
  } else if (command === "add") {
    sendAddString();
  } else {
    msg.reply(
      "Invalid argument. Please use `nfu_oredic help` for more information."
    );
  }
}

function main() {
  const version = getCurrentMinVer();
  let args = tag.args;

  if (!args) {
    sendAllOredics(getAllOredics(), version);
    return;
  }

  const input = args.split(" ");
  determineLogic(input, version);
}

main();
