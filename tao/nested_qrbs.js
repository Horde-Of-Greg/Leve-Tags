util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const qrbs = ModuleLoader.loadModuleFromTag("module_qrbs");

const firstQbs = qrbs(tag.args);
const firstQbsLength = firstQbs.length;
const secondQrbs = qrbs(firstQbsLength);

msg.reply(secondQrbs);
