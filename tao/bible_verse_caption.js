
const args = tag.args;
title = "";
body = "";
if (args) {
  if (args.match(/^\w+ \d{1,2}:\d{1,3}$/i)) {
    const book = args.split(" ")[0];
    const chapterVerse = args.split(" ")[1];
    const chapter = chapterVerse.split(":")[0];
    const verse = chapterVerse.split(":")[1];
    try {
      body = http.request(
        `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-asv/books/${book.toLowerCase()}/chapters/${chapter}/verses/${verse}.json`
      ).data.text;
    } catch (e) {
      msg.reply("Invalid book, chapter, or verse. Please check your input.");
    }
    title = args;
  } else {
    msg.reply("Invalid format. Please use 'Book Chapter:Verse' format.");
  }
} else {
  const request = http.request("https://bible-api.com/?random=verse").data;
  title = request.reference;
  body = request.text;
}

const text = `${title}\n${body}`;
tag = {
  args: text,
};

util.executeTag("caption");

