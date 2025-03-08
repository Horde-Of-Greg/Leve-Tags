function main() {
  // Check for an attached file in the message.
  if (!msg.attachments || msg.attachments.length === 0) {
    msg.reply(
      "No reactor JSON attachment provided. Please attach a .json file."
    );
    return;
  }

  const fileUrl = msg.attachments[0].url;
  const response = http.request(fileUrl);
  let reactorJSON = response.data;

  if (typeof reactorJSON !== "object" || reactorJSON === null) {
    msg.reply("The file content did not return a valid JSON object.");
    return;
  }

  let result = validateHellrageJSON(reactorJSON);
  if (result.valid) {
    msg.reply(
      "✅ Valid Hellrage Reactor Planner JSON." +
        (result.message ? "\n" + result.message : "")
    );
  } else {
    msg.reply("❌ Invalid Hellrage Reactor Planner JSON: " + result.message);
  }
}

function validateHellrageJSON(json) {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, message: "JSON must be an object." };
  }

  if (!("InteriorDimensions" in json)) {
    return { valid: false, message: "Missing 'InteriorDimensions' property." };
  }
  if (!("CompressedReactor" in json)) {
    return { valid: false, message: "Missing 'CompressedReactor' property." };
  }

  if (!validatePos(json.InteriorDimensions)) {
    return {
      valid: false,
      message:
        "Invalid 'InteriorDimensions'. Expected an object with numeric X, Y, and Z.",
    };
  }

  let reactor = json.CompressedReactor;
  if (
    typeof reactor !== "object" ||
    reactor === null ||
    Array.isArray(reactor)
  ) {
    return { valid: false, message: "'CompressedReactor' must be an object." };
  }

  for (let key in reactor) {
    let arr = reactor[key];
    if (!Array.isArray(arr)) {
      return {
        valid: false,
        message: `Property '${key}' in CompressedReactor must be an array.`,
      };
    }
    if (arr.length < 1) {
      return {
        valid: false,
        message: `Array for property '${key}' must have at least one item.`,
      };
    }
    for (let i = 0; i < arr.length; i++) {
      if (!validatePos(arr[i])) {
        return {
          valid: false,
          message: `Invalid position at index ${i} in property '${key}'. Expected an object with numeric X, Y, and Z.`,
        };
      }
    }
  }
  return { valid: true };
}

function validatePos(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  const props = ["X", "Y", "Z"];
  for (let prop of props) {
    if (!(prop in obj)) return false;
    if (typeof obj[prop] !== "number") return false;
  }
  return true;
}

main();
