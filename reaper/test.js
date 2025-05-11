util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const {getTargetUser} = ModuleLoader.loadModuleFromTag("user_util");
user = getTargetUser();

msg.reply({
    embed: {
      author: {
        name: user.displayName,
        icon_url: user.displayAvatarURL,
      },
      description: `<@${user.id}>`,
    },
  });