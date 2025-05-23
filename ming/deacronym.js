((_) => {
  if (!tag.args) {
    msg.reply("\`\`\`Usage: %t deacronym <acronym> / list.\`\`\`");
    return;
  }
  let args = tag.args.toLowerCase();

  if (args === "list") {
    let acronyms = {};
    util
      .dumpTags()
      .filter((line) => line.startsWith("acronym_"))
      .forEach((acronym) => (acronyms[acronym] = util.executeTag(acronym)));
    let output = Object.entries(acronyms)
      .map(([name, desc]) => `${name.replace(/^acronym_/, "")}: ${desc}`)
      .join("\n");

    msg.reply({
      file: {
        name: "acronyms.txt",
        data: `A list of ${Object.keys(acronyms).length} Acronyms:\n${output}`,
      },
    });
    return;
  }

  let acronyms = args.trim().split(/\s+/);

  let description = [];
  for (const acronym of acronyms) {
    try {
      const output = util.executeTag("acronym_" + acronym);
      description.push(`${acronym.toUpperCase()}: ${output}`);
    } catch (e) {
      msg.reply(
        `\`\`\`No Acronym Found, see if you misspelled, if ${acronym} is a real acryonym, add it with %t add acronym_<acronym>.\`\`\``,
      );
      return;
    }
  }

  if (description.length > 3) {
    msg.reply({
      file: {
        name: "acronyms.txt",
        data: description.join("\n\n"),
      },
    });
  } else {
    msg.reply(`\`\`\`${description.join("\n\n")}\`\`\``);
  }
})();

