
"use strict";

const options = {
    excludedNames: [/^ck_/],
    excludedUsers: []
};

function fullDump(search, options = {}) {
    const excludedNames = options.excludedNames ?? [],
        excludedUsers = options.excludedUsers ?? [],
        fixTags = options.fixTags ?? false;

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

    let tags = all.reduce((tags, name) => {
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

    if (!fixTags) {
        return tags;
    }

    const tagNameRegex = /^[A-Za-z0-9\-_]+$/,
        scriptBodyRegex = /^`{3}([\S]+)?\n([\s\S]+)\n`{3}$/u;

    tags = tags.filter(tag => [tag.name, tag.body].every(prop => typeof prop === "string"));
    tags = tags.filter(tag => tag.name.length > 0 && tag.name.length <= 32 && tagNameRegex.test(tag.name));

    tags.forEach(tag => {
        tag.isAlias = tag.hops.length > 1;
        tag.aliasName = "";

        if (tag.isAlias) {
            tag.isScript = false;

            tag.name = tag.hops[0];
            tag.aliasName = tag.hops[1];
            tag.body = "";

            return;
        } else {
            tag.args = "";
        }

        const scriptMatch = tag.body.match(scriptBodyRegex);
        tag.isScript = scriptMatch !== null;

        if (tag.isScript) {
            tag.body = scriptMatch[2];
        }
    });

    return tags;
}

(() => {
    let tabs = 0,
        fixTags = false;

    if (tag.args === "fix") {
        fixTags = true;
    } else if (tag.args) {
        tabs = Number.parseInt(tag.args, 10);

        if (Number.isNaN(tabs) || tabs < 0) {
            return ':warning: Invalid value for "tabs".';
        }
    }

    options.fixTags = fixTags;
    const tags = fullDump(null, options);

    msg.reply({
        file: {
            name: "tags.json",
            data: JSON.stringify(tags, undefined, tabs)
        }
    });
})();

