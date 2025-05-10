const fs = require("fs");

const biblePrefix = "akjv";
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

function getFirstLetter(line) {
  return line.charAt(0).toLowerCase();
}

const letterMap = new Map([
  ["a", new Map()],
  ["b", new Map()],
  ["c", new Map()],
  ["d", new Map()],
  ["e", new Map()],
  ["f", new Map()],
  ["g", new Map()],
  ["h", new Map()],
  ["i", new Map()],
  ["j", new Map()],
  ["k", new Map()],
  ["l", new Map()],
  ["m", new Map()],
  ["n", new Map()],
  ["o", new Map()],
  ["p", new Map()],
  ["q", new Map()],
  ["r", new Map()],
  ["s", new Map()],
  ["t", new Map()],
  ["u", new Map()],
  ["v", new Map()],
  ["w", new Map()],
  ["x", new Map()],
  ["y", new Map()],
  ["z", new Map()],
]);

lines.forEach((line) => {
  const [word, value] = line.split(" ");
  const firstLetter = getFirstLetter(word);
  const wordMap = letterMap.get(firstLetter);
  count = parseInt(value);
  const lastEntry = Array.from(wordMap.entries()).pop();
  const currentCount = lastEntry ? lastEntry[1] : 0;
  wordMap.set(word, currentCount + count);
  letterMap.set(firstLetter, wordMap);
});

fs.writeFileSync(
  `./tao/storage/bibleWordsMap-Alphabetical.json`,
  JSON.stringify(
    Object.fromEntries(
      [...letterMap].map(([letter, map]) => [letter, Object.fromEntries(map)])
    ),
    null,
    2
  )
);

const maxSize = 20 * 1024; // 20kB
let currentGroup = {};
let fileIndex = 1;

// Get sorted array of letters
const sortedLetters = Object.keys(Object.fromEntries(letterMap)).sort();

sortedLetters.forEach((letter) => {
  const letterData = Object.fromEntries(letterMap.get(letter));
  const tempGroup = { ...currentGroup, [letter]: letterData };
  const tempString = JSON.stringify(tempGroup, null, 2);
  if (Buffer.byteLength(tempString, "utf8") > maxSize) {
    if (Object.keys(currentGroup).length === 0) {
      fs.writeFileSync(
        `./tao/storage/bibleWordsMap-Alphabetical-Split/bibleWordsMapAlphabetical-Part${fileIndex}.json`,
        JSON.stringify({ [letter]: letterData }, null, 2)
      );
      fileIndex++;
    } else {
      fs.writeFileSync(
        `./tao/storage/bibleWordsMap-Alphabetical-Split/bibleWordsMapAlphabetical-Part${fileIndex}.json`,
        JSON.stringify(currentGroup, null, 2)
      );
      fileIndex++;
      currentGroup = { [letter]: letterData };
    }
  } else {
    currentGroup = tempGroup;
  }
});

if (Object.keys(currentGroup).length > 0) {
  fs.writeFileSync(
    `./tao/storage/bibleWordsMap-Alphabetical-Split/bibleWordsMapAlphabetical-Part${fileIndex}.json`,
    JSON.stringify(currentGroup, null, 2)
  );
}
