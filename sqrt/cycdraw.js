
const code = (util.fetchTag("cycdraw_1").body + "\n\n" + util.fetchTag("cycdraw_2").body).slice(5, -3).replace(`\`\`\`

\`\`\`js`, "\n\n");
eval(code);
