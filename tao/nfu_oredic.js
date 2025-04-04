// TODO: Add logic comprehension for the oredics
// TODO: Add even more format forcing for the oredics
// -> Force snake case using a map of words that start an oredic
// -> Force inverse wildcard prepending due to a bug with AE2 (e.g. *(ore1|ore2) -> (*ore1|*ore2))

const globalConstants = (() => {
  return {
    version: fetchCurrentMinVer(),
    args: tag.args,
    argArr: tag.args ? tag.args.split(" ") : [],
    oredicTags: fetchAllOredicTags(),
    blacklist: fetchBlacklist(),
    shorteningMap: fetchShorteningMap(),
    allTags: util.dumpTags(),
  };
})();

function main() {
  if (!globalConstants.args) {
    sendAllOredics(globalConstants.oredicTags, globalConstants.version);
    return;
  }
  determineLogic();
}

function determineLogic() {
  const { argArr, version, oredicTags } = globalConstants;
  const command = argArr[0];

  const handlers = {
    all: () => sendAllOredics(oredicTags, version),
    a: () => sendAllOredics(oredicTags, version),
    steps: () => sendAllSteps(oredicTags, version),
    s: () => sendAllSteps(oredicTags, version),
    help: () => sendHelpString(),
    h: () => sendHelpString(),
    debug: () => sendDebugString(),
    d: () => sendDebugString(),
    add: () => sendAddString(),
    formatting: () => sendGoodPracticesString(),
  };
  if (command.startsWith("is_step")) {
    return sendIsAStep(argArr[1], version);
  }
  if (handlers.hasOwnProperty(command)) {
    return handlers[command]();
  }
  if (isExistingOredic(command, version)) {
    return sendOredic(command, version);
  }
  msg.reply(
    "Invalid argument. Please use `nfu_oredic help` for more information."
  );
}

// ------- Fetch/Get Logic -------
// Get : take an input and return an output
// Fetch : return a static value
function parseOredictTag(tagName) {

}


function getTagBody(tagName) {
  const tag = util.fetchTag(tagName);
  let tagBody = tag.body;
  tagBody = tagBody.replace(/`/g, "");
  return tagBody;
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

function getTitleAndText(body) {
  let title = body.split("\n")[0];
  let text = body.replace(title, "");
  title = title.replace(":", "");
  text = text.replace(/\n/g, "");
  return [title, text];
}

function fetchCurrentMinVer() {
  return util.fetchTag("tao_storage_curr_nomi_version").body.split(".")[1];
}

function fetchAllOredicTags() {
  const validOredicTag = /^nfu_oredic_[a-z-]+_\d$/;
  // A oredic tag must follow this format: nfu_oredic_<stepName>_<minorVerNumberNomi>
  return util.dumpTags().filter((tag) => validOredicTag.test(tag));
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
  if (getAllSteps(globalConstants.oredicTags, version).includes(stepName)) {
    return true;
  }
  return false;
}

function isBlacklisted(stepName) {
  return globalConstants.blacklist.includes(stepName);
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
// 6. Remove double wildcards (e.g. ore1** -> ore1*)
// 7. Force wildcard appending again to clean up the result of the shortening

function formatOredicString(oredicString) {
  const pipeline = [
    (string) => string.replace(/ /g, ""), // Remove spaces
    removeDoubleGrouping,
    forceWildcardAppend,
    shortenOredic,
    removeDoubleWildcards,
    forceWildcardAppend, // Clean up after shortening
  ];

  return pipeline.reduce((result, fn) => fn(result), oredicString);
}

function removeDoubleGrouping(oredic) {
  return oredic.replace(/\(\(([\S\s]*?)\)\)/g, (match, capture) => {
    return "(" + capture.replace(/[()]/g, "") + ")";
  });
}

function forceWildcardPrepend(oredic) {
  return oredic.replace(/\(([^)]+)\)/g, (match, groupContent) => {
    const alternatives = groupContent.split("|");
    if (alternatives.every((alt) => alt.startsWith("*"))) {
      return (
        "*" + "(" + alternatives.map((alt) => alt.slice(1)).join("|") + ")"
      );
    }
    return match;
  });
}

function forceWildcardAppend(oredic) {
  return oredic.replace(/\(([^)]+)\)/g, (match, groupContent) => {
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
  const map = globalConstants.shorteningMap;
  for (let [key, value] of map) {
    if (element.toLowerCase() === key.toLowerCase())
      return `${capitalize(value)}*`;
  }
  return element;
}

function shortenOredic(oredic) {
  const map = globalConstants.shorteningMap;
  for (let [key, value] of map) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    oredic = oredic.replace(
      new RegExp(escapedKey, "gi"),
      `${capitalize(value)}`
    );
  }
  return oredic;
}

function removeDoubleWildcards(str) {
  return str.replace(/\*{2,}/g, "*");
}

function forceSnakeCase(str) {


function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ------- Sending Logic -------
function formattedAnswer(body) {
  const [title, text] = getTitleAndText(body);
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

function embeddedFormattedAnswer(body) {
  const [title, text] = getTitleAndText(body);

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

function sendAllOredics(oredicTags, version) {
  let output = "";
  for (let step of getAllSteps(oredicTags, version)) {
    output += "----------------\n";
    output += formattedAnswer(getTagBody(getOredicTag(step, version))) + "\n";
  }
  msg.reply(output);
}

function sendOredic(step, version) {
  msg.reply(formattedAnswer(getTagBody(getOredicTag(step, version))));
}

function sendAllSteps(oredicTags, version) {
  const steps = getAllSteps(oredicTags, version);
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
        "* Capitalize the first letter of the shortened oredic string\n" +
        "* Remove use of double wildcards (mostly a problem with the script itself)\n" +
        "  e.g. `ore1** -> ore1*`\n\n" +
        "**YOU DO NOT NEED TO ENFORCE THESE PRACTICES YOURSELF. THE TAG WILL DO IT FOR YOU.**",
    },
  });
}

function sendDebugString() {
  output = "";
  output += "Current version: " + globalConstants.version + "\n";
  output += "Received input: " + tag.args + "\n";
  output +=
    "Read from version tag: " +
    util.fetchTag("tao_storage_curr_nomi_version").body +
    "\n";
  output += "All oredics: " + globalConstants.oredicTags + "\n";
  output +=
    "All steps: " +
    getAllSteps(globalConstants.oredicTags, globalConstants.version) +
    "\n";
  output += "Shortening map: " + globalConstants.shorteningMap + "\n";
  output += "Shortened oredic: " + shortenOredic("aluminum") + "\n";
  output += "Blacklist: " + globalConstants.blacklist + "\n";

  if (!output.trim()) output = "Leveret is working but debug output is empty.";
  msg.reply(output);
}

main();
