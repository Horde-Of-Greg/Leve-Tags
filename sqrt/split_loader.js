if (!tag.args) {
    msg.reply("split_loader: :warning: No tag names provided.");
    throw String.fromCodePoint(0x200b);
}

const tags = tag.args.split(" "),
    slice = body => body.slice(6, -4);

const code = tags
    .map(name => util.fetchTag(name).body)
    .map(slice)
    .join("");

eval(code);
