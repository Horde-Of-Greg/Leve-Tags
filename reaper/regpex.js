util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const {getTargetUser, getTargetMessage, getTargets} = ModuleLoader.loadModuleFromTag("user_util");
const message = getTargetMessage();
const user = getTargetUser(msg);

let content = message.content;
content = content.replace(/\w/g, '$&ex ');

msg.reply({
    embed: {
        author: {
            name: user.displayName,
            icon_url: user.displayAvatarURL,
        },
        description: content,
    },
});
