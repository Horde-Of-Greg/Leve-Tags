// Essential Logic
function getTagBody(tagName) {
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
  // Change all occurrences of "((...)(...))" to "(... ...)"
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
  let offset = 0;

  while ((match = regex.exec(str)) !== null) {
    const fullMatch = match[0];
    const groupContent = match[1];
    const oreName = groupContent.split("|");

    if (oreName.every((alt) => alt.startsWith("*"))) {
      const newOreName = oreName.map((alt) => alt.slice(1));
      const newGroup = "(" + newOreName.join("|") + ")";

      const startIndex = match.index + offset;
      transformed =
        transformed.slice(0, startIndex) +
        newGroup +
        transformed.slice(startIndex + fullMatch.length);

      offset += newGroup.length - fullMatch.length;

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

function getTitleAndText(body) {
  var title = body.split("\n")[0];
  var text = body.replace(title, "");
  title = title.replace(":", "");
  text = text.replace(/\n/g, "");
  return [title, text];
}

function formattedAnswer(body) {
  var [title, text] = getTitleAndText(body);
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

function embeddedAnswer(body) {
  var [title, text] = getTitleAndText(body);

  switch (includesEscapeStrings(text)) {
    case 0: // If the oredic string does not start with any escape strings
      return {
        name: title,
        value: formatOredicString(text),
      };
    case 1: // If the oredic string starts with \text
      return {
        name: title,
        value: text.replace(/\\text/g, ""),
      };
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
  const steps = getAllSteps(oredics, version);
  const output = steps.map((step) => `* ${step} \n`);
  msg.reply({
    embed: {
      title: "All the available steps",
      description: output.join(""),
    },
  });
}

function sendIsAStep(step, version) {
  if (isExistingOredic(step, version)) {
    msg.reply("Yes, this step exists.");
  } else {
    msg.reply("No, this step does not exist.");
  }
}

function sendAddString() {
  msg.reply({
    embed: {
      title: "Adding a new oredic",
      fields: [
        {
          name: "Tag Format",
          value:
            "**Tag name:** `nfu_oredic_<stepName>_<minorVerNumberNomi>`\n" +
            "**Tag body:**\nTitle:\nContent:",
        },
        {
          name: "Examples",
          value:
            "Tag name : **nfu_oredic_good-title-with-dashes-for-spaces_6**\n" +
            "Title: The title of the oredic\n" +
            "Content: The actual oredic string\n" +
            "Valid for: 1.6, 1.6.1\n\n" +
            "Tag name : **nfu_oredic_crushing-space-ores_7**\n" +
            "Title: Space Ore Crush\n" +
            "Content: The oredic string for crushing space ores\n" +
            "Valid for: 1.7, 1.7.1, 1.7.2, 1.7.3, 1.7.4",
        },
      ],
    },
  });
}

function sendHelpString() {
  msg.reply({
    embed: {
      title: "Usage",
      description: "Usage: nfu_oredic <arg>",
      fields: [
        {
          name: "Args",
          value:
            "* `all`: returns all the oredics\n" +
            "* `steps`: returns all the that you can call\n" +
            "* `<step>`: returns the oredic for the given step\n" +
            "* `is_step <step>`: returns whether the step exists\n" +
            "* `add` : explains how to add a new oredic",
        },
      ],
    },
  });
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
