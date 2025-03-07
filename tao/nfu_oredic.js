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

// Helper functions
function removeDoubleGrouping(str) {
  let prev;
  // This regex matches an opening parenthesis, optional whitespace,
  // another opening parenthesis, then a sequence of characters that are not parentheses,
  // then a closing parenthesis, optional whitespace, and a closing parenthesis.
  do {
    prev = str;
    str = str.replace(/\(\s*\(([^()]+)\)\s*\)/g, "($1)");
  } while (str !== prev);
  return str;
}

function forceWildcardFormatting(str) {
  // Change all occurrences of "(*...|*...)" to "*(...|...)"
  const regex = /\(([^)]+)\)/g;
  let match;
  let transformed = str;
  // We'll track index changes with an offset
  let offset = 0;

  while ((match = regex.exec(str)) !== null) {
    const fullMatch = match[0]; // e.g. "(*Chalcopyrite|*Cooperite|*Tetrahedrite|*Bornite|*Chalcocite|*Pentlandite)"
    const groupContent = match[1]; // the inner part without parentheses
    const oreName = groupContent.split("|");

    // Check if every alternative starts with "*"
    if (oreName.every((alt) => alt.startsWith("*"))) {
      // Remove the wildcard from each alternative
      const newOreName = oreName.map((alt) => alt.slice(1));
      const newGroup = "(" + newOreName.join("|") + ")";

      // Calculate the actual index in the transformed string
      const startIndex = match.index + offset;
      // Replace the old group with the new formatted group
      transformed =
        transformed.slice(0, startIndex) +
        newGroup +
        transformed.slice(startIndex + fullMatch.length);

      // Adjust offset for difference in length
      offset += newGroup.length - fullMatch.length;

      // Check if a wildcard is immediately before the group; if not, insert one.
      if (startIndex > 0 && transformed[startIndex - 1] !== "*") {
        transformed =
          transformed.slice(0, startIndex) +
          "*" +
          transformed.slice(startIndex);
        offset += 1;
      }
    }
  }
  return transformed;
}

function formatOredicString(oredicString) {
  // Remove all spaces
  let str = oredicString.replace(/ /g, "");
  // Remove all double brackets
  str = removeDoubleGrouping(str);
  // Force wildcard formatting
  str = forceWildcardFormatting(str);
  return str;
}

function includesEscapeStrings(str) {
  if (str.startsWith("\\text")) {
    return 1;
  } else {
    return 0;
  }
}

function formattedAnswer(body) {
  //Fetch the title and the oredic string from the body
  var title = body.split("\n")[0];
  var text = body.replace(title, "");
  // Format the title and the oredic string
  title = title.replace(":", "");
  text = text.replace(/\n/g, "");
  // Format the answer
  const codeBlock = "```";
  switch (includesEscapeStrings(text)) {
    case 0: // If the oredic string does not start with any escape strings
      return `## ${title}:\n${codeBlock}\n${formatOredicString(
        text
      )}\n${codeBlock}`;
    case 1: // If the oredic string starts with \text
      return `## ${title}:\n${codeBlock}\n${text.replace(
        /\\text/g,
        ""
      )}\n${codeBlock}`;
  }
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
    output += "----------------\n";
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
