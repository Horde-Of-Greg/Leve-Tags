
const args = tag.args
let message = "";
message += `arg1 : ${args[0]} \n`;
message += `arg2 : ${args[1]} \n`;
var fetchedCode = util.fetchTag(args[0]).body;
message += `code : ${fetchedCode} \n`;
fetchedCode = fetchedCode.replace(/`/g, "");
fetchedCode = fetchedCode.replace("js", "");
var dynamicFunction = eval("(" + fetchedCode + ")");
var result = dynamicFunction(args[1]);
msg.reply(result);
