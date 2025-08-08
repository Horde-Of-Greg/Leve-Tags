
let based = [
//["    User ID         "]           name
  "476161490815287306",     //MkcTao
  "688439290035830810",     //Mireole
  "858048708377182218",     //Svamp
  "280486590780932096",     //Gregmeister
  "276585037388972032",     //ADDION
  "539917854770987018",     //ofavor
  "325625714550374410",     //Reel
  "1268965187935797248",     //SexyBot
  "900856671973306398",     //Dan
  "382758037334786048",     //JustNotPro
  "227245431891951635",     //Rusted
  "423248971998429184",     //Hyperiif
  "436097109352251394",     //Alper Celik
  "517344602068615199",     //BuilderMan
  "1192128065275449414",     //SmallMing
  "517023348513964043",     //BoulesDeFromages
  "824722371201335338",     //MookySpan
  "1171816694851833919",    //Kim
];

util.executeTag("has_krill_issue");

const buf = [];
buf.push("Successfully distilled:\n");
const authors = new Set(util.fetchMessages().filter(x => x.authorId).map(x => x.authorId));
authors.forEach((id) => {
  if (!based.includes(id)) buf.push(`<@${id}>, `);
});
buf.join(" ").replace(/,\s*$/, "")
