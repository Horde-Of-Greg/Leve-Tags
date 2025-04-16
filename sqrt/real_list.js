const tags = util.dumpTags().filter(name => !name.startsWith("ck_")).filter(name => {
    try {
        return util.fetchTag(name).owner === msg.authorId;
    } catch(err) {
        return false;
    }
});

msg.reply({
    file: {
        name: "tags.txt",
        data: tags.map((name, i) => `${i + 1}. ${name}`).join("\n")
    }
});
