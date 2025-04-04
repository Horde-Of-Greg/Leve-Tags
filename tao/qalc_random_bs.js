const length = tag.args[0];
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
util.executeTag("qalc", randomString.toString());
