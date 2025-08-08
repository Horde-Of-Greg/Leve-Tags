
const start = new Date().getTime() + 31556952000 * 3;
const end = start + 31556952000 * 5;

(`:information_source: **${tag.args || "TJCEu"}** is coming out on **${new Date(start + Math.random() * (end - start)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).replace(/20\d\d/, Math.random() * 10 ** (Math.floor(Math.random() * (308 - 4)) + 5) )}**.`)
