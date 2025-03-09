// TODO: Add logic comprehension for the oredics
// TODO: Add even more format forcing for the oredics

// Main function
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
  } else if (command === "formatting") {
    sendGoodPracticesString();
  } else {
    msg.reply(
      "Invalid argument. Please use `nfu_oredic help` for more information."
    );
  }
}

// ------- Fetch/Get Logic -------
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
    const stepName = oredic.split("_")[2];
    if (oredic.includes(version) && !isBlacklisted(stepName)) {
      output.push(stepName);
    }
  }
  return output;
}

function getCurrentMinVer() {
  return util.fetchTag("tao_storage_curr_nomi_version").body.split(".")[1];
}

function getTitleAndText(body) {
  var title = body.split("\n")[0];
  var text = body.replace(title, "");
  title = title.replace(":", "");
  text = text.replace(/\n/g, "");
  return [title, text];
}

function fetchBlacklist() {
  return util.fetchTag("tao_storage_oredic_blacklist").body.split(",");
}

function fetchShorteningMap() {
  const data = util.fetchTag("tao_storage_oredic_shortening_map").body;
  const map = new Map();
  data.split("\n").forEach((line) => {
    line = line.trim();
    if (!line) return;
    const [key, value] = line.split(",").map((s) => s.trim());
    map.set(key, value);
  });
  const sortedEntries = [...map.entries()].sort(
    (a, b) => b[0].length - a[0].length
  );
  return new Map(sortedEntries);
}

// ------- Boolean/Checking logic -------
function isExistingOredic(stepName, version) {
  if (getAllSteps(getAllOredics(), version).includes(stepName)) {
    return true;
  }
  return false;
}

function isBlacklisted(stepName) {
  return fetchBlacklist().includes(stepName);
}

function includesEscapeStrings(str) {
  if (str.startsWith("\\text")) {
    return 1;
  } else {
    return 0;
  }
}

// ------- Transformation Logic -------

// Current transformation logic operations:
// 1. Remove all spaces
// 2. Remove all double brackets (e.g. ((ore1|ore2)) -> (ore1|ore2)
// 3. Force wildcard formatting
//   i. If all alternatives in a group start with *, prepend * to the group
//   e.g. (*ore1|*ore2) -> *(ore1|ore2)
//   ii. If all alternatives in a group end with *, append * to the group
//   e.g. (ore1*|ore2*) -> (ore1|ore2)*
// 4. Shorten the oredic strings using the shortening map
// 5. Capitalize the first letter of the shortened oredic string

function removeDoubleGrouping(str) {
  return str.replace(/\(\(([\S\s]*?)\)\)/g, (match, capture) => {
    return "(" + capture.replace(/[()]/g, "") + ")";
  });
}

function forceWildcardPrepend(str) {
  return str.replace(/\(([^)]+)\)/g, (match, groupContent) => {
    const alternatives = groupContent.split("|");
    if (alternatives.every((alt) => alt.startsWith("*"))) {
      return (
        "*" + "(" + alternatives.map((alt) => alt.slice(1)).join("|") + ")"
      );
    }
    return match;
  });
}

function forceWildcardAppend(str) {
  return str.replace(/\(([^)]+)\)/g, (match, groupContent) => {
    const alternatives = groupContent.split("|");
    if (alternatives.every((alt) => alt.endsWith("*"))) {
      return (
        "(" + alternatives.map((alt) => alt.slice(0, -1)).join("|") + ")" + "*"
      );
    }
    return match;
  });
}

function shortenOreElement(element) {
  const map = fetchShorteningMap();
  for (let [key, value] of map) {
    if (element.toLowerCase() === key.toLowerCase())
      return `${capitalize(value)}*`;
  }
  return element;
}

function shortenOredic(str) {
  let result = str;
  const map = fetchShorteningMap();
  for (let [key, value] of map) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(escapedKey, "gi"),
      `${capitalize(value)}*`
    );
  }
  return result;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatOredicString(oredicString) {
  // Remove all spaces
  let str = oredicString.replace(/ /g, "");
  // Remove all double brackets
  str = removeDoubleGrouping(str);
  // Force wildcard formatting
  str = forceWildcardPrepend(str);
  str = forceWildcardAppend(str);
  // Shorten the oredic string
  str = shortenOredic(str);
  return str;
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

// ------- Sending Logic -------
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
            "* `add` : explains how to add a new oredic\n" +
            "* `formatting` : explains the formatting enforced by this tag",
        },
      ],
    },
  });
}

function sendGoodPracticesString() {
  msg.reply({
    embed: {
      title: "Formatting enforced by this tag",
      description:
        "These are the best practices enforced by this tag:\n" +
        "* Remove all spaces\n" +
        "* Remove all double brackets\n" +
        "  e.g. `((ore1|ore2)) -> (ore1|ore2)`\n" +
        "* If all the elements inside a group start with a wildcard,\n" +
        "  prepend the wildcard to the group\n" +
        "  e.g. `(*ore1|*ore2) -> *(ore1|ore2)`\n" +
        "* If all the elements inside a group end with a wildcard,\n" +
        "  append the wildcard to the group\n" +
        "  e.g. `(ore1*|ore2*) -> (ore1|ore2)*`\n" +
        "* Shorten the oredic string using the shortening map\n" +
        "* Capitalize the first letter of the shortened oredic string\n\n" +
        "**YOU DO NOT NEED TO ENFORCE THESE PRACTICES YOURSELF. THE TAG WILL DO IT FOR YOU.**",
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
  output +=
    "All steps: " + getAllSteps(getAllOredics(), getCurrentMinVer()) + "\n";
  output += "Shortening map: " + fetchShorteningMap() + "\n";
  output += "Shortened oredic: " + shortenOredic("aluminum") + "\n";
  output += "Blacklist: " + fetchBlacklist() + "\n";

  if (!output.trim()) output = "Leveret is working but debug output is empty.";
  msg.reply(output);
}

main();
