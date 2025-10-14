// py_interpreter.js

// Main function to interpret Python code
function interpretPython(pythonCode, initialSymbolTable = {}) {
    const lines = pythonCode.split('\\n')
        .map(line => line.trim())
        .filter(line => line !== '' && !line.startsWith('#')); // Ignore comments and empty lines
    
    // Create a new symbol table for this interpretation run, optionally initialized
    // Making a shallow copy of the initial symbol table to avoid modifying it directly if it's passed around.
    const symbolTable = { ...initialSymbolTable }; 

    for (const line of lines) {
        try {
            executeLine(line, symbolTable);
        } catch (e) {
            console.error(`Error on line: "${line}"\\nMessage: ${e.message}`);
            return { success: false, symbolTable, error: e.message }; 
        }
    }
    return { success: true, symbolTable };
}

// Parses a string value into a number, string, boolean, null, or retrieves from symbol table
function parseValue(valueStr, symbolTable) {
    valueStr = valueStr.trim();

    // 1. Check for string literal (double or single quotes)
    if ((valueStr.startsWith('"') && valueStr.endsWith('"')) || (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
        return valueStr.substring(1, valueStr.length - 1);
    }
    
    // 2. Check for Python's boolean/None literals
    if (valueStr === "True") return true;
    if (valueStr === "False") return false;
    if (valueStr === "None") return null;

    // 3. Check for number literal (integer or float)
    // Regex covers integers, floats, and decimals starting with '.' (e.g., .5)
    if (/^-?(\\d+(\\.\\d+)?|\\.\\d+)$/.test(valueStr) && !isNaN(parseFloat(valueStr))) {
         // Avoid parsing "Infinity" or "NaN" strings if they weren't explicitly float('inf') etc.
        const lowerValueStr = valueStr.toLowerCase();
        if (lowerValueStr === 'infinity' || lowerValueStr === '-infinity' || lowerValueStr === 'nan') {
            // Python requires float('inf'), etc. These bare words are not numbers here.
            // Fall through to variable check or error.
        } else {
            return parseFloat(valueStr);
        }
    }
    
    // 4. Check if it's a variable name (must be an identifier)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(valueStr)) {
        if (symbolTable.hasOwnProperty(valueStr)) {
            return symbolTable[valueStr];
        } else {
            throw new Error(`NameError: name '${valueStr}' is not defined`);
        }
    }

    throw new Error(`ValueError: invalid literal or unsupported value: ${valueStr}`);
}

// Executes a single line of Python code
function executeLine(line, symbolTable) {
    const pythonKeywords = [
        "False", "None", "True", "and", "as", "assert", "async", "await", "break", 
        "class", "continue", "def", "del", "elif", "else", "except", "finally", 
        "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", 
        "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
        // Adding 'print' here as we don't want to allow reassigning our built-in print
        "print", "reply"
    ];

    // Pattern 1: Variable assignment (e.g., x = 10 or x = "hello" or x = y)
    let assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\\s*=\\s*(.*)$/);
    if (assignmentMatch) {
        const varName = assignmentMatch[1];
        const valueExpression = assignmentMatch[2].trim();

        if (pythonKeywords.includes(varName)) {
            throw new Error(`SyntaxError: cannot assign to keyword '${varName}'`);
        }
        // Redundant check if first regex part is good, but good for clarity
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) { 
             throw new Error(`SyntaxError: invalid syntax for variable name '${varName}'`);
        }

        symbolTable[varName] = parseValue(valueExpression, symbolTable);
        return;
    }

    // Pattern 2: Reply statement
    let replyMatch = line.match(/^reply\\s*\\((.*)\\)$/);
    if (replyMatch) {
        const fullArgsStr = replyMatch[1].trim();
        
        if (fullArgsStr === '') { // Handles reply()
            msg.reply(''); 
            return;
        }

        // Rudimentary argument splitting by comma.
        // LIMITATION: This will NOT correctly handle commas within string literals passed directly
        // to print, e.g., print("a,b", c) will be misinterpreted as two arguments '"a' and 'b"'.
        // A variable containing a comma, e.g. x = "a,b"; print(x) IS handled correctly.
        const argSegments = fullArgsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        if (argSegments.length === 0 && fullArgsStr.length > 0) {
            // e.g. print(',') or if a single argument was complex and split yielded nothing.
            // Attempt to parse the whole string as one argument.
            try {
                const val = parseValue(fullArgsStr, symbolTable);
                msg.reply(val);
            } catch (e) {
                throw new Error(`SyntaxError: Invalid reply arguments: '${fullArgsStr}'. Original error: ${e.message}`);
            }
        } else if (argSegments.length > 0) {
            const printValues = argSegments.map(argStr => parseValue(argStr, symbolTable));
            msg.reply(...printValues);
        } else {
             // This case means fullArgsStr was non-empty but split yielded no valid segments.
             // This might happen with print(,), which is invalid.
             throw new Error(`SyntaxError: No valid arguments found in print statement: print(${fullArgsStr})`);
        }
        return;
    }

    throw new Error(`SyntaxError: unsupported syntax or operation on line: ${line}`);
}


// Example usage section (for testing in Node.js environment)
if (typeof require !== 'undefined' && require.main === module) {
    const runTest = (name, code, initialTable = {}) => {
        console.log(`\n--- ${name} ---`);
        console.log("Interpreting Python code:\n" + code.trim());
        // Deep copy initialTable if it's complex, for simple values spread is fine.
        // For production, a robust deep copy would be needed if tables are complex.
        const tableForTest = JSON.parse(JSON.stringify(initialTable)); 
        const result = interpretPython(code, tableForTest);
        
        if (result.success) {
            console.log("Output produced (via console.log above).");
            console.log("Result: Success. Final Symbol Table:", result.symbolTable);
        } else {
            // Error message is already printed by interpretPython
            console.log("Result: Failed. Final Symbol Table (at point of error):", result.symbolTable);
        }
        return result.symbolTable; // Return table for potential chaining in tests
    };

    let sharedTable = {}; // Used to demonstrate passing symbol table between calls

    runTest("Input", msg.content);
}

// Export for use as a module (e.g., in a web page or another Node.js script)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { interpretPython, parseValue, executeLine };
}
// If used in a browser, you might want to attach interpretPython to the window object
// else if (typeof window !== 'undefined') {
//   window.interpretPython = interpretPython;
// }


