
const excludedNames = [/^ck_/],
    excludedUsers = [];

function fullDump(search, excludedNames = [], excludedUsers = []) {
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
            if (typeof tag.name !== "string" || typeof tag.body !== "string") {
                return tags;
            }

            const userExcluded = enableUserBlacklist && excludedUsers.includes(tag.owner);

            if (!userExcluded) {
                tags.push(tag);
            }
        }

        return tags;
    }, []);
}

function isScript(tag) {
    return tag.body.startsWith("```") && tag.body.endsWith("```");
}

const t_name = msg.content.split(" ")[1],
    usage = `Use \`%t ${t_name} query\` to find 
all tags whose name contains a string.
Use \`-c\` to find all tags whose body contains a string.`;

let split = tag.args?.split(" ") ?? [],
    flag = split[0],
    query = split[1];

let searchBody = flag === "-c";

if (!searchBody) {
    query = split[0];
}

query = query?.trim();

if (!query) {
    ":warning: No query provided.\n" + usage;
} else {
    let textTags;

    if (query === "all") {
        query = null;
        searchBody = false;
    }

    if (searchBody) {
        textTags = fullDump(null, excludedNames, excludedUsers).filter(
            tag => !isScript(tag) && tag.body.includes(query)
        );
    } else {
        textTags = fullDump(query, excludedNames, excludedUsers).filter(tag => !isScript(tag));
    }

    textTags = textTags.map(tag => {
        if (tag.hops.length < 2) {
            return tag;
        }

        tag.name = tag.hops[0];
        tag.body = `Alias of "${tag.hops[1]}"`;

        return tag;
    });

    if (textTags.length === 0) {
        ":information_source: Found no similar tags.\n" + usage;
    } else {
        textTags.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

        const data = textTags.map((t, i) => `${i + 1}. %t ${t.name}\n${t.body}`).join("\n---\n\n");

        msg.reply({
            file: {
                name: "tags.txt",
                data
            }
        });
    }
}

