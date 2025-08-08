
function main() {
  // Ensure there is at least one file attached.
  if (!msg.attachments || msg.attachments.length === 0) {
    msg.reply(
      "No reactor JSON attachment provided. Please attach a .json file."
    );
    return;
  }

  // Use the first attachment's URL to fetch its content.
  const fileUrl = msg.attachments[0].url;
  const response = http.request(fileUrl);

  // Since the HTTP response returns a parsed JSON object, use it directly.
  let reactorJSON = response.data;

  if (typeof reactorJSON !== "object" || reactorJSON === null) {
    msg.reply("The file content did not return a valid JSON object.");
    return;
  }

  // Validate the JSON against the Einsteinium reactor schema.
  let result = validateEinsteiniumJSON(reactorJSON);

  if (result.valid) {
    msg.reply(
      "✅ Valid Einsteinium Reactor JSON." +
        (result.message ? "\n" + result.message : "")
    );
  } else {
    msg.reply("❌ Invalid Einsteinium Reactor JSON: " + result.message);
  }
}

function validateEinsteiniumJSON(json) {
  // The expected keys for an Einsteinium reactor file are "metadata" and "content".
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, message: "JSON must be an object." };
  }

  if (!("metadata" in json)) {
    return { valid: false, message: "Missing 'metadata' property." };
  }
  if (!("content" in json)) {
    return { valid: false, message: "Missing 'content' property." };
  }

  // Validate the metadata.
  let meta = json.metadata;
  if (typeof meta !== "object" || meta === null) {
    return { valid: false, message: "'metadata' must be an object." };
  }

  // Check required metadata fields.
  if (!("version" in meta) || typeof meta.version !== "string") {
    return {
      valid: false,
      message: "Invalid or missing 'version' in metadata.",
    };
  }
  if (
    !("dimensions" in meta) ||
    !Array.isArray(meta.dimensions) ||
    meta.dimensions.length !== 3
  ) {
    return {
      valid: false,
      message:
        "Invalid or missing 'dimensions' in metadata. Expected an array of three numbers.",
    };
  }
  for (let i = 0; i < 3; i++) {
    if (typeof meta.dimensions[i] !== "number") {
      return {
        valid: false,
        message: "Each value in 'dimensions' must be a number.",
      };
    }
  }
  if (!("name" in meta) || typeof meta.name !== "string") {
    return { valid: false, message: "Invalid or missing 'name' in metadata." };
  }
  if (!("validationCode" in meta) || typeof meta.validationCode !== "string") {
    return {
      valid: false,
      message: "Invalid or missing 'validationCode' in metadata.",
    };
  }
  // Optionally, you could check if the validationCode contains an expected substring.
  if (meta.validationCode.indexOf("Einsteinium") === -1) {
    return {
      valid: false,
      message:
        "'validationCode' does not appear to be valid for an Einsteinium reactor.",
    };
  }

  // Validate the content array.
  let content = json.content;
  if (!Array.isArray(content)) {
    return { valid: false, message: "'content' must be an array." };
  }

  // The dimensions in metadata should match the shape of the content.
  let [expectedX, expectedY, expectedZ] = meta.dimensions;
  if (content.length !== expectedX) {
    return {
      valid: false,
      message: `The outer array length in 'content' (${content.length}) does not match the first dimension (${expectedX}).`,
    };
  }

  for (let x = 0; x < content.length; x++) {
    let slice = content[x];
    if (!Array.isArray(slice)) {
      return {
        valid: false,
        message: `Content at index ${x} is not an array.`,
      };
    }
    if (slice.length !== expectedY) {
      return {
        valid: false,
        message: `Content at index ${x} length (${slice.length}) does not match the second dimension (${expectedY}).`,
      };
    }
    for (let y = 0; y < slice.length; y++) {
      let row = slice[y];
      if (!Array.isArray(row)) {
        return {
          valid: false,
          message: `Content at index ${x},${y} is not an array.`,
        };
      }
      if (row.length !== expectedZ) {
        return {
          valid: false,
          message: `Content at index ${x},${y} length (${row.length}) does not match the third dimension (${expectedZ}).`,
        };
      }
      for (let z = 0; z < row.length; z++) {
        if (typeof row[z] !== "number") {
          return {
            valid: false,
            message: `Content at index ${x},${y},${z} is not a number.`,
          };
        }
      }
    }
  }

  return { valid: true };
}

main();

