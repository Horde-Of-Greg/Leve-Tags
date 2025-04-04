function tokenNode(token) {
  if (token === "*") {
    return {
      type: "wildcard",
    };
  }
  return {
    type: "token",
    token,
  };
}

function operatorNode(
  operator,
  children,
  leftChildren = [],
  rightChildren = []
) {
  switch (operator) {
    case "!":
      return {
        type: "operator",
        operator: "NOT",
        children,
      };
    case "^":
      return {
        type: "operator",
        operator: "XOR",
        leftChildren,
        rightChildren,
      };
    case "|":
      return {
        type: "operator",
        operator: "OR",
        children,
      };
    case "&":
      return {
        type: "operator",
        operator: "AND",
        children,
      };
    default:
      console.error("Invalid operator: " + operator);
      break;
  }
}

function groupNode(elements) {
  return {
    type: "group",
    elements,
  };
}

function seekUntilNextOperator(oredictString, index) {
  const length = oredictString.length;
  output = "";
  while (index < length) {
    const char = oredictString[index];
    if (char === "&" || char === "|" || char === "^") {
      return output;
    }
    output += char;
    index++;
  }
}

function parseOredict(oredictString, startIndex = 0) {
  let index = startIndex;
  const length = oredictString.length;
  let nodes = [];
  let currentToken = "";

  while (index < length) {
    const char = oredictString[index];
    const prevChar = oredictString[index - 1];
    const preprevChar = oredictString[index - 2];

    if (char === " ") {
      index++;
      continue;
    }

    if (char === "(") {
      if (currentToken) {
        nodes.push(tokenNode(currentToken));
        currentToken = "";
      }
      if (prevChar === "!") {
        const { nodes: groupNodes, newIndex } = parseOredict(
          oredictString,
          index + 1
        );
        nodes.push(operatorNode("!", groupNodes));
        index = newIndex;
        continue;
      }
      const { nodes: groupNodes, newIndex } = parseOredict(
        oredictString,
        index + 1
      );
      nodes.push(groupNode(groupNodes));
      index = newIndex;
      continue;
    }
    if (char === ")") {
      if (currentToken) {
        nodes.push(tokenNode(currentToken));
      }
      return { nodes, newIndex: index + 1 };
    }
    // Handle operators
    if (char === "&") {
      leftChild = currentToken;
      currentToken = "";
      rightChild = seekUntilNextOperator(oredictString, index + 1);
      index += rightChild.length;
      children = [leftChild, rightChild];
      nodes.push(operatorNode(char, children));
      continue;
    }
    currentToken += char;
    index++;
  }
  if (currentToken) nodes.push(tokenNode(currentToken));
  return { nodes, newIndex: index };
}
