
function main() {
  // Get input from tag arguments
  let input = tag.args;
  
  // If no text input is provided, check for an attached file
  if ((!input || input.trim() === "") && msg.attachments && msg.attachments.length > 0) {
    // Use the first attachment's URL
    const fileUrl = msg.attachments[0].url;
    // Fetch file content synchronously; adjust property (data/text) as needed based on your HTTP API
    const response = http.request(fileUrl);
    input = response.data; // or response.text
  }
  
  if (!input || input.trim() === "") {
    util.reply("No reactor JSON provided. Please pass the JSON as text or attach a file.");
    return;
  }
  
  let reactorJSON;
  try {
    reactorJSON = JSON.parse(input);
  } catch (e) {
    util.reply("Invalid JSON provided: " + e.message);
    return;
  }
  
  // Validate the JSON against the Hellrage Reactor Planner schema
  let result = validateHellrageJSON(reactorJSON);
  
  if (result.valid) {
    util.reply("✅ Valid Hellrage Reactor Planner JSON." + (result.message ? "\n" + result.message : ""));
  } else {
    util.reply("❌ Invalid Hellrage Reactor Planner JSON: " + result.message);
  }
}

function validateHellrageJSON(json) {
  // Ensure the JSON is an object
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, message: "JSON must be an object." };
  }
  // Check for required properties
  if (!("InteriorDimensions" in json)) {
    return { valid: false, message: "Missing 'InteriorDimensions' property." };
  }
  if (!("CompressedReactor" in json)) {
    return { valid: false, message: "Missing 'CompressedReactor' property." };
  }
  // Validate InteriorDimensions: must follow the 'pos' schema (object with numeric X, Y, Z)
  if (!validatePos(json.InteriorDimensions)) {
    return { valid: false, message: "Invalid 'InteriorDimensions'. Expected an object with numeric X, Y, and Z." };
  }
  
  // Validate CompressedReactor: must be an object with properties that are arrays of positions
  let reactor = json.CompressedReactor;
  if (typeof reactor !== "object" || reactor === null || Array.isArray(reactor)) {
    return { valid: false, message: "'CompressedReactor' must be an object." };
  }
  
  // For each property in CompressedReactor, ensure it's an array with at least one valid position
  for (let key in reactor) {
    let arr = reactor[key];
    if (!Array.isArray(arr)) {
      return { valid: false, message: `Property '${key}' in CompressedReactor must be an array.` };
    }
    if (arr.length < 1) {
      return { valid: false, message: `Array for property '${key}' must have at least one item.` };
    }
    for (let i = 0; i < arr.length; i++) {
      if (!validatePos(arr[i])) {
        return { valid: false, message: `Invalid position at index ${i} in property '${key}'. Expected an object with numeric X, Y, and Z.` };
      }
    }
  }
  return { valid: true };
}

function validatePos(obj) {
  // A valid position is an object with numeric properties X, Y, and Z
  if (typeof obj !== "object" || obj === null) return false;
  const props = ["X", "Y", "Z"];
  for (let prop of props) {
    if (!(prop in obj)) return false;
    if (typeof obj[prop] !== "number") return false;
  }
  return true;
}

main();
