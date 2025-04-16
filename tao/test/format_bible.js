const fs = require("fs");

const biblePrefix = "asv";
const bibleCountedPath =
  "./tao/test/storage/Bibles-counted/bible-" + biblePrefix + "-counted.txt";
const bibleCounted = fs.readFileSync(bibleCountedPath, "utf8");

var lines = bibleCounted.split("\n");
lines.splice(0, 1);
lines.splice(lines.length - 1, 1);
lines = lines.map((line) => {
  line = line.replace(/\d+\./, "");
  line = line.replace("times", "");
  line = line.replace(/ /g, "");
  line = line.replace(":", " ");
  return line;
});
lines = lines.join("\n");

const maxSizeBytes = 20 * 1024; // 20kB in bytes
const linesArr = lines.split("\n");
let fileIndex = 0;
let currentContent = "";

linesArr.forEach((line, i) => {
  let newContent = currentContent ? currentContent + "\n" + line : line;
  if (Buffer.byteLength(newContent, "utf8") > maxSizeBytes) {
    if (currentContent) {
      fs.writeFileSync(
        `./tao/storage/bibleWordsMapSplit/bibleWordsMap-${fileIndex}.txt`,
        currentContent
      );
      fileIndex++;
      currentContent = line;
    } else {
      fs.writeFileSync(
        `./tao/storage/bibleWordsMapSplit/bibleWordsMap-${fileIndex}.txt`,
        line
      );
      fileIndex++;
      currentContent = "";
    }
  } else {
    currentContent = newContent;
  }
});

// Write any remaining content.
if (currentContent) {
  fs.writeFileSync(
    `./tao/storage/bibleWordsMapSplit/bibleWordsMap-${fileIndex}.txt`,
    currentContent
  );
}
