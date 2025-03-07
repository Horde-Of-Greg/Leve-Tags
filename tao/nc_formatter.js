function main() {
  let input = tag.args;
  let args = fetchArgs(input);
  let reactorJSON = fetchReactorJSON(input);

  // Define any options
  const options = {
    excludeActiveCoolers: args.includes("--excludeActiveCoolers"),
    excludeCasings: args.includes("--excludeCasings"),
    excludeModerators: args.includes("--excludeModerators"),
    graphite: args.includes("--graphite"),
    beryllium: args.includes("--beryllium"),
    displayStats: args.includes("--displayStats"),
  };

  // Call the formatting function
  const formattedReactor = formatReactor(reactorJSON, options);

  // Reply with the formatted output
  title = generateTitle(options);
  util.reply(msg.reply(formatOutput(formattedReactor, title, options)));
}

/*
 * Main Logic Functions
 */

// Example implementation of formatReactor (this would be the core transformation logic)
function formatReactor(json, opts) {
  // Process json based on its type (Hellrage, LEU‑235, or Einsteinium) and options
  if (isHellrage(json)) {
    return formatHellrage(json, opts);
  } else if (isLEU235(json)) {
    return formatLEU235(json, opts);
  } else if (isEinsteinium(json)) {
    return formatEinsteinium(json, opts);
  } else {
    return "Invalid Reactor Type";
  }
}

function formatHellrage(json, opts) {
  // Implement the formatting logic for Hellrage reactors
}

function formatLEU235(json, opts) {
  // Implement the formatting logic for LEU‑235 reactors
}

function formatEinsteinium(json, opts) {
  // Implement the formatting logic for Einsteinium reactors
}

/*
 * Helper Functions
 */
function isValidJSON(json) {
  if (isHellrage(json) || isLEU235(json) || isEinsteinium(json)) {
    return true;
  }
  return false;
}

function isHellrage(json) {
  // Check if the JSON is of type Hellrage
}

function isLEU235(json) {
  // Check if the JSON is of type LEU‑235
}

function isEinsteinium(json) {
  // Check if the JSON is of type Einsteinium
}

function fetchArgs(input) {
  // Extract the arguments from the input
}

function fetchReactorJSON(input) {
  // Extract the reactor JSON string from the input
}

/*
 * View Functions
 */

function sendHelpString() {
  const helpString = `
  **NC Formatter Command Help**
  This command formats a NuclearCraft reactor JSON string into a Building Gadgets string.
  Usage: \`!nc_formatter <args> <reactor_json>\`
  Available Arguments:
  - \`--excludeActiveCoolers\`: Exclude active coolers in the output.
  - \`--excludeCasings\`: Exclude casings in the output.
  - \`--excludeModerators\`: Exclude moderators in the output.
  - \`--graphite\`: Use graphite blocks as moderators.
  - \`--beryllium\`: Use beryllium blocks as moderators.
  - \`--displayStats\`: Display the reactor stats in the output.
  - \`--help\`: Display this help message.
  You can also use the website by Nomi-CEu at https://nomi-ceu.github.io/NC-Formatter/
  `;
  util.reply(helpString);
}

function formatOutput(output) {
  // Format the output string for display
}

main();
