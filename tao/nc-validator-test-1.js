
function main() {
  let input = msg.attachements;
  let reactorJSON;

  // Try parsing the input JSON
  try {
    reactorJSON = JSON.parse(input);
  } catch (e) {
    msg.reply("Invalid JSON provided: " + e.message);
    return;
  }

  // Validate the JSON against our Hellrage Reactor Planner schema
  let result = validateHellrageJSON(reactorJSON);

  if (result.valid) {
    msg.reply("✅ Valid Hellrage Reactor Planner JSON." + (result.message ? "\n" + result.message : ""));
  } else {
    msg.reply("❌ Invalid Hellrage Reactor Planner JSON: " + result.message);
  }
}

function validateHellrageJSON(json) {
  // Check that json is an object
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, message: "JSON must be an object." };
  }
  // Required properties check
  if (!("InteriorDimensions" in json)) {
    return { valid: false, message: "Missing 'InteriorDimensions' property." };
  }
  if (!("CompressedReactor" in json)) {
    return { valid: false, message: "Missing 'CompressedReactor' property." };
  }
  // Validate InteriorDimensions: Must be a valid position
  if (!validatePos(json.InteriorDimensions)) {
    return { valid: false, message: "Invalid 'InteriorDimensions'. Expected an object with numeric X, Y, and Z." };
  }
  // Validate CompressedReactor: Must be an object
  let reactor = json.CompressedReactor;
  if (typeof reactor !== "object" || reactor === null || Array.isArray(reactor)) {
    return { valid: false, message: "'CompressedReactor' must be an object." };
  }
  // For each key in CompressedReactor, the value must be an array of valid positions
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
  // A position object must be an object with numeric X, Y, and Z
  if (typeof obj !== "object" || obj === null) return false;
  const props = ["X", "Y", "Z"];
  for (let prop of props) {
    if (!(prop in obj)) return false;
    if (typeof obj[prop] !== "number") return false;
  }
  return true;
}

main();
