function splitArgs(str, sep = " ") {
    const ind = str.indexOf(sep);

    let name, args;

    if (ind === -1) {
        name = str;
        args = "";
    } else {
        name = str.slice(0, ind);
        args = str.slice(ind + 1);
    }

    return [name.toLowerCase(), args];
}

if (typeof tag.args === "undefined" || tag.args.length < 1) {
    `%t ${tag.name} \`name\``;
} else {
    const [name, args] = splitArgs(tag.args),
        t = util.fetchTag(name);

    if (!t) {
        `:warning: Tag **${name}** doesn't exist.`;
    } else {
        const e_args = t.args;
        util.executeTag(name, args + e_args);
    }
}
