
 const g = http.request("https://cdn.discordapp.com/attachments/927073124086849577/1059527089344225350/message.txt").data.split("\n");

const t = util.dumpTags();

const n = g.filter(x => !t.includes(x));

const h = n.join(", ") + "\n\nTags left to restore: " + n.length;

h;
