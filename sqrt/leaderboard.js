"use strict";

const options = {
    excludedNames: [/^ck_/],
    excludedUsers: []
};

const limit = 10;

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

function genLeaderboard(type, limit) {
    const tags = fullDump(null, options).filter(tag => tag.hops?.length === 1 || (tag.hops?.length > 1 && tag.args)),
        info = {};

    tags.forEach(t => {
        if (typeof t.body !== "undefined") {
            if (typeof info[t.owner] === "undefined") {
                info[t.owner] = {
                    count: 0,
                    size: 0
                };
            }

            info[t.owner].count++;
            info[t.owner].size += t.body.length;
        }
    });

    const result = [];

    if (type === 0) {
        const sortedCount = Object.keys(info).sort((a, b) => info[b].count - info[a].count);

        for (let i = 0; i < limit; i++) {
            const owner = sortedCount[i];
            result.push(`${i + 1}. <@${owner}>: ${info[owner].count}`);
        }
    } else {
        const sortedSize = Object.keys(info).sort((a, b) => info[b].size - info[a].size);

        for (let i = 0; i < limit; i++) {
            const owner = sortedSize[i];
            result.push(`${i + 1}. <@${owner}>: ${(info[owner].size / 1024).toFixed(3)}kb`);
        }
    }

    return result;
}

(() => {
    const type = { count: 0, size: 1 }[tag.args];

    if (typeof type === "undefined") {
        return "Invalid leaderboard type. Possible values are 'count' and 'size'.";
    }

    const res = genLeaderboard(type, limit),
        title = type === 0 ? "Tag count leaderboard" : "Tag size leaderboard";

    if (res.length === 0) {
        return "No tags.";
    }

    msg.reply({
        embed: {
            title,
            description: res.join("\n")
        }
    });
})();
