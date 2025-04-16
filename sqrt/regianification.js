// thank you https://stackoverflow.com/a/7616484
String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

if (!tag.args) {
    const name = msg.author.nickname ?? msg.author.username;
    (`${name} -> regian transformation progress: ${Number(msg.author.id.slice(-16, -2)) % 100}%`)
} else if (tag.args.includes("regian")) {
    (`regian -> regian transformation progress: 42069%`)
} else {
    (`${tag.args} -> regian transformation progress: ${tag.args.hashCode() % 100}%`)
}