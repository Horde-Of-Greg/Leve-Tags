util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const {getTargetUser, isWhitelisted} = ModuleLoader.loadModuleFromTag("user_util");
const user = getTargetUser(msg);
if (user.id != msg.author.id && !isWhitelisted(msg.author)) {
    if (isWhitelisted(user)) msg.reply("NotBasedError: <@" + msg.author.id + "> suffers from a major krill issue, cannot proceed.");
}