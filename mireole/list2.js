
const user = tag.args ? util.findUsers(tag.args)[0] : msg.author;
const all = util.dumpTags();
const tags = all.reduce((tags, t) => {
        let tag;
        try {
            tag = util.fetchTag(t);
        } catch(err) {}

        if(typeof tag !== "undefined" && tag.owner == user.id) {
            tags.push(t);
        }

        return tags;
    }, []);
msg.reply(tags.join("\n"));
