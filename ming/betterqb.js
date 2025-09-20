function main() {
  if (!tag.args || tag.args.length < 2) {
    msg.reply("\`\`\`The better(tm) quest book reader! simply %t alias <your qb> betterqb <questbook link> for questing goodness!\nUsage: %t betterqb <search prompt / quest number> <questbook link>\n--desc to search by description.\n--raw to remove markdown formats.\`\`\`");
    return;
  }

  let args = tag.args.split(" ")

  const flags = args.filter((value) => value.startsWith("--"));
  const qbsource =  args.pop();
  args = args
    .filter((value) => !value.startsWith("--"));

  const search_prompt = args.join(" ");
  let desc_flag = flags.includes("--desc");

  const wrap_lines = (s) => s.replace(
    /(?![^\n]{1,80}$)([^\n]{1,80})\s/g, '$1\n'
  );

  const normalize_qb_text = (text) => {
    const format_codes = {
      "§k": "",
      "§l": "**",
      "§m": "~~",
      "§n": "__",
      "§o": "*"
    }
    text = text.replace(/(§[^r])+\s*§r/g, "");
    text = text.replace(/§[0-9abcdeg]/g, "§l");
    text = text.replace(/(§[^r])(\s+)/g, "$2$1")
      .replace(/(\s+)(§r)/g, "$2$1")

    const raw = (text.trim() + "§r").split(/(\s*)(§.)(\s*)/g);

    const format_set = new Set();
    return raw.map((tok) => {
      const match = tok.match(/§(.)/);
      if (match) {
        if (match[1] == "r") {
          const format = Array.from(format_set).reverse().join("");
          format_set.clear();
          return format;
        }
        if (match[1] == "f") {
          if (format_set.delete("**")) return "**";

          return;
        }
        const format = flags.includes("--raw") ? "" : format_codes[tok];
        if (!format) return;
        if (!format_set.has(format)) {
          format_set.add(format);
          return format;
        }
      }
      else return tok;
    }).filter(x => x !== undefined).join("")
  }

  const normalize_qb_title = (text) => normalize_qb_text(text.replace(/§./g, ""));

  const qb = http.request(
    qbsource,
  ).data;

  const questDB = qb["questDatabase:9"];
  const quests = Object.keys(questDB).map((key) => {
    const props = questDB[key]["properties:10"]["betterquesting:10"];
    return {
      name: props["name:8"],
      desc: props["desc:8"],
      id: key.replace(/:10$/, ""),
      preRequisites: questDB[key]["preRequisites:11"],
      taskLogic: props["tasklogic:8"]
    };
  });

  if (isNaN(search_prompt)) {
    const regex = new RegExp(search_prompt.toLowerCase());
    const found_quests = desc_flag ?
      quests.filter(obj => regex.test(obj.desc.toLowerCase())) :
      quests.filter(obj => regex.test(obj.name.toLowerCase()))

    if (found_quests.length == 0) {
      return `No quests found with the name \"${search_prompt}\", see if you misspelled. Also try using "--desc" to search by description.`
    }
    if (found_quests.length == 1) {
      return `**${found_quests[0].name}**\n\n${wrap_lines(normalize_qb_text(found_quests[0].desc))}`;
    }
    return `Found Multiple quests:\n\n${found_quests.map(obj => `${obj.id}: ${normalize_qb_title(obj.name)}`).join("\n")}`;
  }
  else {
    const quest = quests.find(obj => Number(obj.id) === Number(search_prompt));
    return `**${normalize_qb_title(quest.name)}**\n\n${wrap_lines(normalize_qb_text(quest.desc))}`;
  }
}

main()
