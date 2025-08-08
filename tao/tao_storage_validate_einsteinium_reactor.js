

function validateEinsteiniumJSON(json) {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { valid: false, message: "JSON must be an object." };
  }

  if (!("metadata" in json)) {
    return { valid: false, message: "Missing 'metadata' property." };
  }
  if (!("content" in json)) {
    return { valid: false, message: "Missing 'content' property." };
  }

  let meta = json.metadata;
  if (typeof meta !== "object" || meta === null) {
    return { valid: false, message: "'metadata' must be an object." };
  }

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
  if (meta.validationCode.indexOf("Einsteinium") === -1) {
    return {
      valid: false,
      message:
        "'validationCode' does not appear to be valid for an Einsteinium reactor.",
    };
  }

  let content = json.content;
  if (!Array.isArray(content)) {
    return { valid: false, message: "'content' must be an array." };
  }

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
