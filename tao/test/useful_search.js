const fs = require("fs");
const { type } = require("os");
let fullDump = fs.readFileSync("./tao/storage/full_dump.txt", "utf8");
console.log(typeof fullDump);
fullDump = fullDump.replace(/\"/g, "");
fullDump = fullDump.replace("[", "");
fullDump = fullDump.replace("]", "");
fullDump = fullDump.split(",");

function filterImpossibleTags(tagNames) {
  const impossibleTags = [];
  const possibleTags = [];
  const pexgex = /^[A-Za-z0-9\-_]+$/;
  let allowed = true;
  tagNames.forEach((tag) => {
    allowed = true;
    if (tag.length > 32) {
      allowed = false;
      impossibleTags.push(tag);
    }
    if (!pexgex.test(tag)) {
      allowed = false;
      impossibleTags.push(tag);
    }
    if (allowed) {
      possibleTags.push(tag);
    }
  });
  return { possibleTags, impossibleTags };
}

function filterTagsRegex(tagNames) {
  const numericSuffixRegex = /^(.*?)([_]?)(\d+)$/;
  const onlyNumbersRegex = /^\d+$/;
  const onlySpecialCharsRegex = /^[^a-zA-Z]+$/;
  const storageStringsRegex = /test|storage/;
  const activateWindowsRegex = /^ck_/;
  const acronymRegex = /^acronym_/;
  const sussysussyRegex = /(among|amog|sus|sussy|impostor)+/;
  const susRegex2 = /(a+m+o+n?g+|s+u+s+)+/;
  const whatTheFuckIsEvenThisTagRegex = /^pjfkeuf/;
  const contraptionNoooRegex = /^contraption.+$/;
  const whatWhatThatGuyDoingRegex = /^prismatic.+$/;

  // Function to check if a tag contains 4 or more consecutive repeated characters.
  const hasRepeatedChars = (tag) => /(.)(\1){3,}/.test(tag);

  // Arrays to store valid tags and an object for the filtered-out (useless) tags with reasons.
  const usefulTags = [];
  const uselessTags = [];

  tagNames.forEach((tag) => {
    let allowed = true;
    // Rule 2: Tag length.
    // Rule 3: Repeated characters.
    if (hasRepeatedChars(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (numericSuffixRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (storageStringsRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    // Rule 4: Tag is only numbers or special characters.
    if (onlyNumbersRegex.test(tag) || onlySpecialCharsRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (activateWindowsRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (acronymRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (sussysussyRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (susRegex2.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (whatTheFuckIsEvenThisTagRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (contraptionNoooRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (whatWhatThatGuyDoingRegex.test(tag)) {
      allowed = false;
      uselessTags.push(tag);
    }
    if (allowed) {
      usefulTags.push(tag);
    }
  });
  return { usefulTags, uselessTags };
}

function filterByEntropy(tagNames) {
  function shannonEntropy(str) {
    const frequencies = {};
    for (const char of str) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    const len = str.length;
    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }
  function normalizedEntropy(str) {
    if (str.length === 0) return 0;
    const actualEntropy = shannonEntropy(str);
    const maxEntropy = Math.log2(str.length);
    return actualEntropy / maxEntropy;
  }
  function filterTagsByEntropy(tags, threshold = 0.6) {
    const accepted = [];
    const rejected = [];

    for (const tag of tags) {
      const normEntropy = normalizedEntropy(tag);
      if (normEntropy < threshold) {
        rejected.push(tag);
      } else {
        accepted.push(tag);
      }
    }
    return { highEntropy: accepted, lowEntropy: rejected };
  }
  return filterTagsByEntropy(tagNames);
}

let { possibleTags, impossibleTags } = filterImpossibleTags(fullDump);
let { usefulTags, uselessTags } = filterTagsRegex(possibleTags);
const { highEntropy, lowEntropy } = filterByEntropy(usefulTags);
let validTags = highEntropy;
let rejectedTags = [...uselessTags, ...impossibleTags, ...lowEntropy];
console.log("Valid tags:", validTags.length);
console.log("Rejected tags:", rejectedTags.length);
console.log("Impossible tags:", impossibleTags.length);
console.log("Tags rejected by regex:", uselessTags.length);
console.log("Tags rejected by entropy:", lowEntropy.length);
validTags.sort();
rejectedTags.sort();
fs.writeFileSync(
  "./tao/test/storage/entropy_rejected.txt",
  highEntropy.join("\n")
);
fs.writeFileSync("./tao/test/storage/filtered_tags.txt", validTags.join("\n"));
fs.writeFileSync(
  "./tao/test/storage/useless_tags.txt",
  rejectedTags.join("\n")
);
