
// Me when I just steal everything from %t contraption :trolley:

const og = "https://media.discordapp.net/attachments/1217263355698614334/1217263356017115157/2024-03-13_00.58.24.png?ex=66fc8f57&is=66fb3dd7&hm=c61f180081f575f5085b51df173e771051b3a5f4c0d3cd103ffe2bfb383057c2&=&format=webp&quality=lossless&width=1850&height=1040";

const nameMap = {
    anti_contraption1: "fuck u"
};
const Util = {
    splitStr: str => {
        const ind = str.indexOf(" ");

        if (ind === -1) {
            return str;
        }

        return str.substr(0, ind);
    },

    randElement: (arr, a = 0, b = arr.length - 1) => {
        return arr[a + ~~(Math.random() * (b - a))];
    },

    executeTag: name => {
        const tag = util.fetchTag(name);

        if (typeof tag === "undefined" || tag.body === ".") {
            return;
        }

        if (!(tag.body.startsWith("```js") && tag.body.endsWith("```"))) {
            return tag.body;
        }

        const res = Function("code", "return eval(code)").call(this, tag.body.slice(5, -3));

        if (res === ".") {
            return;
        }

        return res;
    }
};

class AntiContraptions {
    static exp = /^\d+?$/;
    static no = "fuck u";

    constructor(options = {}) {
        this.prefix = options.prefix ?? "anti_contraption";
        this.nameMap = options.nameMap ?? {};

        this.getTags();
    }

    getName(n) {
        const name = this.prefix + n.toString(10);
        return this.mapName(name);
    }

    getNumber(name) {
        const numStr = name.substr(this.prefix.length);
        return parseInt(numStr, 10);
    }

    get(n) {
        const name = this.getName(n);

        if (!name) {
            return;
        }

        return Util.executeTag(name);
    }

    getList() {
        if (typeof this.list !== "undefined") {
            return this.list;
        }

        let list = this.tags.filter(t => {
            if (!t.startsWith(this.prefix)) {
                return false;
            }

            const numStr = t.substr(this.prefix.length);
            return AntiContraptions.exp.test(numStr);
        });

        list = this.mapNames(list);
        this.sortNames(list);

        this.list = list;
        return list;
    }

    getRandom() {
        if (typeof this.list === "undefined") {
            this.getList();
        }

        const name = Util.randElement(this.list);
        return Util.executeTag(name);
    }

    getCount() {
        if (typeof this.list !== "undefined") {
            this.count = this.list.length;
            return this.list.length;
        }

        let n = 1;

        const prefixTags = this.tags.filter(t => t.startsWith(this.prefix));

        for (const t of prefixTags) {
            const numStr = t.substr(this.prefix.length);

            if (AntiContraptions.exp.test(numStr) && !this.isExcluded(t)) {
                n++;
            }
        }

        this.count = n;
        return n;
    }

    getLatest() {
        if (typeof this.latest !== "undefined") {
            return this.latest;
        }

        if (typeof this.list !== "undefined") {
            return this.list[this.list.length - 1];
        }

        let latest = 0;

        const prefixTags = this.tags.filter(t => t.startsWith(this.prefix));

        for (const t of prefixTags) {
            const numStr = t.substr(this.prefix.length);

            if (AntiContraptions.exp.test(numStr) && !this.isExcluded(t)) {
                const num = parseInt(numStr, 10);
                latest = Math.max(num, latest);
            }
        }

        this.latest = latest;
        return latest;
    }

    getNext() {
        if (typeof this.next !== "undefined") {
            return this.next;
        }

        if (typeof this.list === "undefined") {
            this.getList();
        }

        const first = this.getNumber(this.list[0]),
            last = this.getNumber(this.list[this.list.length - 1]);

        let next = first;

        while (next <= last && this.numsInclude(next)) {
            next++;
        }

        this.next = next;
        return next;
    }

    isExcluded(name) {
        return this.nameMap[name] === AntiContraptions.no;
    }

    mapName(name) {
        if (this.isExcluded(name)) {
            return;
        }

        return this.nameMap[name] || name;
    }

    mapNames(list) {
        return list.map(t => this.mapName(t)).filter(t => t);
    }

    sortNames(list) {
        list.sort((a, b) => {
            const aNum = this.getNumber(a),
                bNum = this.getNumber(b);

            return aNum - bNum;
        });
    }

    numsInclude(n) {
        const numStr = n.toString();
        return this.list.find(t => t.endsWith(numStr)) !== undefined;
    }

    getTags() {
        if (typeof this.tags === "undefined") {
            this.tags = util.dumpTags();
        }
    }
}

const t_name = msg.content.split(" ")[1],
    usage = `Usage: %t ${t_name} \`[number/random/list/count/next/latest]\``;

const antiContraptions = new AntiContraptions({
    nameMap
});

function getAntiContraption(input) {
    switch (input) {
        case "":
        case "1":
            return og;
    }

    if (AntiContraptions.exp.test(input)) {
        const n = parseInt(input, 10);

        if (isNaN(n)) {
            out = ":warning: Invalid antiContraption.\n" + usage;
        }

        const antiContraption = antiContraptions.get(n);

        if (typeof antiContraption === "undefined") {
            return `:warning: AntiContraption **${n}** doesn't exist.`;
        }

        return antiContraption;
    }

    return false;
}

function getOption(input) {
    switch (input) {
        case "r":
        case "rand":
        case "random":
            return antiContraptions.getRandom();
        case "list":
            const list = antiContraptions.getList().join("\n");

            msg.reply({
                file: {
                    name: "AntiContraptions.txt",
                    data: "AntiContraptions:\n" + list
                }
            });

            return;
        case "count":
            const count = antiContraptions.getCount();
            return `:information_source: There are **${count}** Anti Contraptions.`;
        case "next":
            const next = antiContraptions.getNext();
            return `:information_source: Next Anti Contraption: **${next}**`;
        case "latest":
            const latest = antiContraptions.getLatest();

            let out = `:information_source: Latest Anti Contraption: **${latest}**\n\n`;
            out += antiContraptions.get(latest);

            return out;
    }

    return false;
}

(_ => {
    const input = Util.splitStr(tag.args || "");

    let out = getAntiContraption(input);

    if (out) {
        return out;
    }

    out = getOption(input);

    if (out) {
        msg.reply(out);
        return;
    }

    return ":warning: Invalid arguments.\n" + usage;
})();
