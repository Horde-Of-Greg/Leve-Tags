const fs = require("fs");

/*
  Pseudo code:
  /*
  Step 1: Define a function that takes the input string and a starting index.
  Step 2: Initialize an empty list (nodes) to store the parsed nodes.
  Step 3: Initialize an empty buffer (currentToken) to accumulate characters.

  Step 4: Loop over the characters of the string starting from the given index:
    - If the character is a whitespace, ignore it.
    - If the character is an alphanumeric or '*' (indicating a token), append it to currentToken.
    - If the character is an operator (like &, |, ^) and we are not inside a group:
        a. If currentToken is non-empty, convert it into a token node and add it to the nodes list.
        b. Determine the operator type.
        c. Use a helper function to scan ahead for the next token or group (this accounts for nested parentheses).
        d. Create an operator node with the left token from currentToken and the right token/group from the helper.
        e. Append the operator node to the nodes list.
    - If the character is an opening parenthesis '(':
        a. Recursively call the parsing function to process the sub-expression until the matching closing parenthesis ')'.
        b. Treat the returned sub-expression as a grouped token.
        c. Append the resulting node (or flattened structure) to the nodes list.
    - If the character is a closing parenthesis ')':
        a. End the current parsing loop.
        b. Return the current nodes list and the new index position.

  Step 5: After exiting the loop, if any characters remain in currentToken, convert it to a token node and append it to the nodes list.

  Step 6: Check for specific operator patterns (for example, consecutive AND operators with OR groups) and perform a flattening process:
    - Merge the OR groups under a single wildcard or combined operator node.
    - Ensure the final AST reflects a simplified structure as required.

  Step 7: Return the final list of nodes along with the index indicating the end position.

  Step 8: In the main execution, call the parser function with the full input string,
      then write out or process the resulting node tree as required.
*/

/*
  Example input:
  crushedPurified* & (*Cinnabar|*GarnetRed|*GarnetYellow|*Lazurite) & (*Galena|*Sphalerite|*Chalcopyrite)
  Output:
  [
    {
      type: "operator",
      operator: "AND",
      children: [
        {
          type: "token",
          token: "crushedPurified*",
        },
        {
          type: "operator",
          operator: "OR",
          children: [
              {
                type: "wildcard",
                children: [
                  {
                    type: "token",
                    token: "Cinnabar",
                  },
                  {
                    type: "token",
                    token: "GarnetRed",
                  },
                  {
                    type: "token",
                    token: "GarnetYellow",
                  },
                  {
                    type: "token",
                    token: "Lazurite",
                  },
                  {
                    type: "token",
                    token: "Galena",
                  },
                  {
                    type: "token",
                    token: "Sphalerite",
                  },
                  {
                    type: "token",
                    token: "Chalcopyrite",
                  },
                ],
              },
          ],
        },
      ],
    },
  ];
  It should recognize that the separating two OR groups with an AND operator
  is the same as having a single group of OR operators.
  The above example should therefore be rebuilt as:
  crushedPurified*&(*Cinnabar|*GarnetRed|*GarnetYellow|*Lazurite|*Galena|*Sphalerite|*Chalcopyrite)
  It should also understand that the wildcard operator can be applied to the entire group.
  The final output should be:
  crushedPurified*&*(Cinnabar|GarnetRed|GarnetYellow|Lazurite|Galena|Sphalerite|Chalcopyrite)
  ^ Except not for now due to a "bug" in AE2's code, so it should rebuild it without prefixing the wildcard.
  But it should still understand that the wildcard operator can be applied to the entire group.
*/

/**
 * parseOredict
 * -------------
 * Parses an oredict expression into an Abstract Syntax Tree (AST).
 *
 * Expected input: A string that can contain:
 *  - Identifiers (e.g. "Aluminum", "Iron")
 *  - Wildcards within identifiers (e.g. "*lu*niu*")
 *  - Unary NOT operator: "!"
 *  - Binary operators: "&" (AND), "|" (OR), "^" (XOR)
 *  - Parentheses for grouping: "(" and ")"
 *
 * Expected output: An object with two properties:
 *  - header: an array of error/warning messages (if any)
 *  - body: the AST representing the parsed expression.
 *
 * The AST nodes are objects with:
 *  - type: "token" or "operator"
 *  - For token nodes:
 *      If the token does not contain wildcards, it has a "token" property.
 *      If it contains wildcards, it is represented as a composite node with a "children" array.
 *  - For operator nodes:
 *      "operator" property is one of "AND", "OR", "XOR", "NOT".
 *      "children" is an array of AST nodes.
 */
function parseOredict(input) {
  // Note: The expected outputs use helper functions like tokenNode and operatorNode to build the expected AST.
  // Make sure these helper functions are available in the same context as this test suite.

  const errors = [];

  // --- Helper: Tokenization ---
  /**
   * tokenize(text)
   * ---------------
   * Input: A string to parse.
   * Output: An array of tokens.
   * Tokens include: "(", ")", "&", "|", "!", "^" or sequences of alphanumeric characters and "*".
   */
  function tokenize(text) {
    const regex = /(\(|\)|&|\||!|\^)|([A-Za-z0-9*]+)/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) tokens.push(match[1]);
      else if (match[2]) tokens.push(match[2]);
    }
    return tokens;
  }

  // --- Helper: Composite Token Parsing ---
  /**
   * parseCompositeToken(tokenStr)
   * -----------------------------
   * Input: A token string that may include "*" characters.
   * Output: A token node.
   * If no "*" is present, returns an object { type: "token", token: tokenStr }.
   * Otherwise, returns an object of type "token" with a "children" array containing:
   *  - literal segments (objects with type "literal" and property value)
   *  - wildcard markers (objects with type "wildcard")
   */
  function parseCompositeToken(tokenStr) {
    if (!tokenStr.includes("*")) return { type: "token", token: tokenStr };
    const segments = tokenStr.split("*");
    const parts = [];
    // Add one leading wildcard if needed.
    if (tokenStr.startsWith("*")) {
      parts.push({ type: "wildcard" });
    }
    // Process segments; add a literal (if nonempty) then a wildcard between segments.
    segments
      .slice(tokenStr.startsWith("*") ? 1 : 0)
      .forEach((segment, idx, arr) => {
        if (segment !== "") parts.push({ type: "literal", value: segment });
        if (idx < arr.length - 1) {
          // Always insert one wildcard between segments.
          parts.push({ type: "wildcard" });
        }
      });
    // Ensure trailing wildcard if token ends with "*" and last part isn't already a wildcard.
    if (tokenStr.endsWith("*") && parts[parts.length - 1].type !== "wildcard") {
      parts.push({ type: "wildcard" });
    }
    return { type: "token", children: parts };
  }

  // --- Node Constructors ---
  /**
   * tokenNode(value)
   * ----------------
   * Input: A string value.
   * Output: A token node.
   * If the value contains "*", it creates a composite token node.
   */
  function tokenNode(value) {
    return value.includes("*")
      ? parseCompositeToken(value)
      : { type: "token", token: value };
  }

  /**
   * operatorNode(operator, children)
   * ---------------------------------
   * Input: An operator string ("&", "|", "^", or "!" interpreted as NOT)
   *        and an array of AST nodes (children).
   * Output: An operator node with properties:
   *   - type: "operator"
   *   - operator: the logical operator ("AND", "OR", "XOR", "NOT")
   *   - children: array of AST nodes.
   */
  function operatorNode(operator, children) {
    let opName;
    if (operator === "&") opName = "AND";
    else if (operator === "|") opName = "OR";
    else if (operator === "^") opName = "XOR";
    else if (operator === "NOT") opName = "NOT";
    else opName = operator;
    return { type: "operator", operator: opName, children };
  }

  // --- Recursive Descent Parser ---
  /**
   * parseExpression(tokens)
   * -----------------------
   * Input: An array of tokens.
   * Output: An AST node representing the parsed expression.
   * Grammar (simplified):
   *   Expression → Primary ( ( "&" | "|" | "^" ) Primary )*
   *   Primary    → "!" Primary | "(" Expression ")" | Identifier
   */
  function parseExpression(tokens) {
    let left = parsePrimary(tokens);
    while (tokens.length && ["&", "|", "^"].includes(tokens[0])) {
      const opToken = tokens.shift();
      const right = parsePrimary(tokens);
      // If left is already the same operator, flatten it.
      if (
        left.type === "operator" &&
        left.operator ===
          (opToken === "&" ? "AND" : opToken === "|" ? "OR" : "XOR")
      ) {
        left.children.push(right);
      } else {
        left = operatorNode(opToken, [left, right]);
      }
    }
    return left;
  }

  /**
   * parsePrimary(tokens)
   * --------------------
   * Input: An array of tokens.
   * Output: An AST node representing a primary expression.
   * Handles:
   *   - Unary NOT: if next token is "!"
   *   - Parenthesized expressions: if next token is "("
   *   - Otherwise, an identifier token.
   */
  function parsePrimary(tokens) {
    if (tokens.length === 0) {
      errors.push("Unexpected end of input");
      return tokenNode("");
    }
    const next = tokens.shift();
    if (next === "!") {
      return operatorNode("NOT", [parsePrimary(tokens)]);
    }
    if (next === "(") {
      const expr = parseExpression(tokens);
      if (tokens.length === 0 || tokens.shift() !== ")") {
        errors.push("Expected closing parenthesis");
      }
      return expr;
    }
    return tokenNode(next);
  }

  // --- Main Execution ---
  const tokens = tokenize(input);
  const ast = parseExpression(tokens);
  if (tokens.length > 0) {
    errors.push("Unexpected tokens remaining: " + tokens.join(" "));
  }

  // --- AST Refinement: Flatten single-child operator nodes ---
  function flattenAST(node) {
    return node;
  }
  const finalAST = flattenAST(ast);

  // Return result as an object with header (errors) and body (AST).
  return { header: errors, body: finalAST };
}

module.exports = parseOredict;

// --- Example Usage ---
const testInputsLong = [
  "crushedPurified* & (!*(Galena|Sphalerite|Chalcopyrite|Cooperite|Tetrahedrite|Bornite)) & (*(Cinnabar|GarnetRed|GarnetYellow|Lazurite|Pyrope|Laurite|Emerald|Realgar|Coal|NetherQuartz|Salt|Quartzite))",
  "((Aluminum|Magnesium)&(Copper|Zinc|Brass|Bronze)) | (!((Tin|Lead)&(Steel|Nickel|Chromium)))",
  "*(Platinum|Palladium|Iridium|Osmium|Rhodium)& (Gold|Silver|Electrum|WhiteGold)",
  "!*(Cobalt|Nickel|Molybdenum)& (Chromium|Tungsten|Vanadium|Titanium)",
  "crushed*Ore & !((Dust|Powder)|(Granulate|Fines)) & (Purified|Processed)",
  "((Diamond|Ruby|Sapphire)|(Emerald|Amethyst|Opal|Topaz)) & *(Graphite|CarbonFiber|ActivatedCarbon)",
  "!(Raw|Impure)&((Refined|Purified)&(Copper|Tin|Iron|Lead))",
  "*lu*niu* & (Alumina|Aluminite|Aluminothermic|AluminumOxide)",
  "((Steel|StainlessSteel)&(CarbonSteel|AlloySteel|ToolSteel)) | (!((Iron|Nickel)&(Chromium|Molybdenum)))",
  "(Apatite|Phosphate)&((Fertilizer|PhosphoricAcid)|!((Waste|Byproduct|Sludge)))",
  "crushedPurified* & ( *(Cinnabar|GarnetRed|GarnetYellow|Lazurite) | (Sulfide|Oxide) ) & (Processed|Refined)",
  "((Silicon|Germanium)|(!((Boron|Phosphorus)&(Arsenic|Antimony)))) & (Quartz|Sodalite|Opal|Feldspar)",
  "*(UltraHighPurity)&(Gold|Silver)&!(Impure|Scrap|Dross)",
  "((Coal|Charcoal)&(Graphite|Coke)) | (*Diamond|*Graphene|Nanodiamond)",
  "!(Unrefined|Raw)&((Refined&Clean)&(Aluminum|Magnesium|Titanium|Bauxite))",
];

const testInputsShort = [
  "crushedPurified* & (*Cinnabar|*GarnetRed|*GarnetYellow|*Lazurite)",
  "Iron|Gold|Tin",
  "((Aluminum|Magnesium)&(Copper|Zinc|Brass|Bronze)) | (!((Tin|Lead)&(Steel|Nickel|Chromium)))",
  "*lu*niu*",
  "!(Raw|Impure)&((Refined|Purified)&(Copper|Tin|Iron|Lead))",
];

const singleTestInput = [
  "crushedPurified* & (*Cinnabar|*GarnetRed|*GarnetYellow|*Lazurite)",
];

testInputs = testInputsShort;

testInputs.forEach((input) => {
  console.log("Input:", input);
  const result = parseOredict(input);
  console.log("Errors:", result.header);
  console.log("AST:", JSON.stringify(result.body, null, 2));
  console.log();
});
