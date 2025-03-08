function main() {
  /*
   * Main function to execute all the methods
   */

  // Fetch the variables
  let input = tag.args;
  let args = fetchArgs(input);
  let reactorJSON = fetchReactorJSON(input);
  const nomiVersion = fetchNomiVersion();

  // Define any options
  const options = {
    excludeActiveCoolers: args.includes("--excludeActiveCoolers"),
    useTransparentCasings: args.includes("--useTransparentCasings"),
    useSolidCasings: args.includes("--useSolidCasings"),
    useGraphite: args.includes("--useGraphite"),
    useBeryllium: args.includes("--useBeryllium"),
    displayStats: args.includes("--displayStats"),
  };

  // Call the formatting function
  const formattedReactor = formatReactor(reactorJSON, options);

  // Reply with the formatted output
  const title = generateTitle(options);
  util.reply(msg.reply(formatOutput(formattedReactor, title, options)));
}

/*
 * Main Logic Functions
 */

// Example implementation of formatReactor (this would be the core transformation logic)
function formatReactor(json, opts) {
  // Process json based on its type (Hellrage, LEU‑235, or Einsteinium) and options
  if (!isValidJSON(json)) {
    return "Invalid JSON provided. Please provide a JSON from either Hellrage, LEU-235, or Einsteinium.";
  }
  if (isHellrage(json)) {
    return formatHellrage(json, opts);
  }
  if (isEinsteinium(json)) {
    return formatEinsteinium(json, opts);
  }
}

function formatHellrage(json, opts) {
  // Implement the formatting logic for Hellrage/LEU-235 reactors
}

function formatEinsteinium(json, opts) {
  // Implement the formatting logic for Einsteinium reactors
}

function calculateStats(json, version) {
  // Calculate the stats of the reactor
  const configs = fetchConfigs(version);
  // Implement the calculations
}

/*
 * Helper Functions
 */
function isValidJSON(json) {
  if (isHellrage(json) || isEinsteinium(json)) {
    return true;
  }
  return false;
}

function isHellrage(json) {
  // Check if the JSON is of type Hellrage
}

function isEinsteinium(json) {
  // Check if the JSON is of type Einsteinium
}

function fetchArgs(input) {
  // Extract the arguments from the input
  const regex = /--\w+/g;
  return input.match(regex);
}

function fetchReactorJSON(input) {
  // Extract the reactor JSON string from the input
  args = fetchArgs(input);
  return input.replace(args, "").trim();
}

function fetchNomiVersion() {
  // Fetch the version of Nomi-CEu
  const fullVersion = util.fetchTag("tao_storage_curr_nomi_version");
  const [major, minor, patch] = fullVersion.split(".");
  return { major, minor, patch };
}

function fetchConfigs(version) {
  // Fetch the configurations of NC for the given Nomi version
  const fullConfigs = util.fetchTag(
    `tao_storage_nc_configs_${version.minor}_${version.patch}`
  );
  const [power, speed, cooling] = fullConfigs.split(",");
  // Exact elements to be extracted TBD
  return { power, speed, cooling };
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
  - \`--useTransparentCasings\`: Use transparent casings in the output.
  - \`--useSolidCasings\`: Use solid casings in the output.
  - \`--useGraphite\`: Use graphite blocks as moderators.
  - \`--useBeryllium\`: Use beryllium blocks as moderators.
  - \`--displayStats\`: Display the reactor stats in the output.
  - \`--help\`: Display this help message.
  You can also use the website by Nomi-CEu at https://nomi-ceu.github.io/NC-Formatter/
  `;
  util.reply(helpString);
}

function formatOutput(output, title, options) {
  // Format the output string for display
}

main();
