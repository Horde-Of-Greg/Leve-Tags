
module.exports = function qrbs(args) {
  const qalc = ModuleLoader.loadModuleFromTag("module_qalc");

  const length = args;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&:/?,;.%^$€£-_°()!§@#<>*+";
  const randomChar = (chars) => {
    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars[randomIndex];
  };

  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString += randomChar(chars);
  }
  return qalc(randomString);
};

