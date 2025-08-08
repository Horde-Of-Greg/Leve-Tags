
"use strict";

const options = {
    excludedNames: [/^ck_/],
    excludedUsers: []
};

function fullDump(search, options = {}) {
    const excludedNames = options.excludedNames ?? [],
        excludedUsers = options.excludedUsers ?? [];

    let all = search ? util.dumpTags().filter(t => t.includes(search)) : util.dumpTags();

    const enableNameBlacklist = excludedNames.length > 0,
        enableUserBlacklist = excludedUsers.length > 0;

    if (enableNameBlacklist) {
        all = all.filter(name =>
            excludedNames.every(bl => {
                if (bl instanceof RegExp) {
                    return !bl.test(name);
                }

                return bl !== name;
            })
        );
    }

    return all.reduce((tags, name) => {
        let tag;

        try {
            tag = util.fetchTag(name);
        } catch (err) {}

        if (tag !== null && typeof tag !== "undefined") {
            const userExcluded = enableUserBlacklist && excludedUsers.includes(tag.owner);

            if (!userExcluded) {
                tags.push(tag);
            }
        }

        return tags;
    }, []);
}

(_ => {
    if (!tag.args) {
        const count = util.dumpTags().length;
        return `:information_source: There are **${count}** registered tags.`;
    }

    let user;

    if (tag.args === "me") {
        user = msg.author;
    } else {
        try {
            user = util.findUsers(tag.args)[0];
        } catch (err) {}
    }

    if (typeof user === "undefined") {
        return `:warning: Couldn't find user.`;
    }

    let tags = fullDump(null, options);
    tags = tags.filter(t => t.owner === user.id);

    if (user === msg.author) {
        return `:information_source: You have **${tags.length}** tags.`;
    } else {
        return `:information_source: <@${user.id}> has **${tags.length}** tags.`;
    }
})();

