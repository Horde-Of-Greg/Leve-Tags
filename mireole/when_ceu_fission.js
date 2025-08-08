
const start = new Date().getTime() + 31556952000 * 3;
const end = start + 31556952000 * 5;

(`:information_source: **${tag.args || "GTCEu Fission"}** is coming out on **${new Date(start + Math.random() * (end - start)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}**.`)
