"use strict";

const og = "https://cdn.discordapp.com/attachments/1165208683559522434/1168510251859980298/1698664944839.png";

const nameMap = {
    contraption1: "fuck u",
    contraption89: "contraption89_",
    contraption120: "contraption120_",
    contraption125: "contraption125_",
    contraption146: "contraption146_",
    contraption302: "contraption302_",
    contraption306: "contraption306_",
    contraption380: "contraptipn380_",
    contraption401: "contraption401_",
    contraption1827: "fuck u"
};

const Util = {
    urlExp: /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/,

    splitStr: str => {
        const ind = str.indexOf(" ");

        if (ind === -1) {
            return str;
        }

        return str.slice(0, ind);
    },

    randElement: (arr, a = 0, b = arr.length - 1) => {
        return arr[a + ~~(Math.random() * (b - a))];
    },

    executeTag: name => {
        const tag = util.fetchTag(name);

        if (tag === null || typeof tag === "undefined" || tag.body === ".") {
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
    },

    isUrl: str => {
        return Util.urlExp.test(str);
    }
};

class Contraptions {
    static numExp = /^\d+?$/;
    static no = "fuck u";

    constructor(options = {}) {
        this.prefix = options.prefix ?? "contraption";
        this.nameMap = options.nameMap ?? {};
    }

    getName(n) {
        return this.mapName(this.getPrefixStr(n));
    }

    getNumber(name) {
        return parseInt(this.getNumStr(name), 10);
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

        let list = this.getValidTags();
        list = this.mapNames(list);
        this.sortNames(list);

        const nums = list.map(elem => elem[1]);
        list = list.map(elem => elem[0]);

        this.nums = nums;
        this.list = list;

        return list;
    }

    getContents() {
        if (typeof this.contents !== "undefined") {
            return this.contents;
        }

        if (typeof this.list === "undefined") {
            this.getList();
        }

        const contents = new Map();

        for (const t of this.list) {
            let content;

            try {
                content = Util.executeTag(t);
            } catch (err) {
                content = "Couln't fetch tag.";
            }

            if (content === null || typeof content === "undefined") {
                content = "Couln't fetch tag.";
            } else if (content.length === 0) {
                content = "Empty";
            }

            contents.set(t, content);
        }

        this.contents = contents;
        return contents;
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

        const prefixTags = this.getTags().filter(t => t.startsWith(this.prefix));

        for (const t of prefixTags) {
            const numStr = t.slice(this.prefix.length);

            if (Contraptions.numExp.test(numStr) && !this.isExcluded(t)) {
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

        this.getList();

        const latest = Math.max(...this.nums);
        this.latest = latest;

        return latest;
    }

    getNext() {
        if (typeof this.next !== "undefined") {
            return this.next;
        }

        const list = this.getList();

        const first = this.getNumber(list[0]),
            last = this.getNumber(list[list.length - 1]);

        let next = first;

        while (next <= last && this.nums.includes(next)) {
            next++;
        }

        this.next = next;
        return next;
    }

    findByUrl(url) {
        if (!Util.isUrl(url)) {
            return false;
        }

        for (const [t, content] of this.getContents().entries()) {
            if (content.includes(url)) {
                return t;
            }
        }
    }

    isExcluded(name) {
        return this.nameMap[name] === Contraptions.no;
    }

    mapName(name) {
        if (this.isExcluded(name)) {
            return;
        }

        return this.nameMap[name] || name;
    }

    mapNames(list) {
        const first = list[0],
            dualList = Array.isArray(first);

        if (dualList) {
            return list.map(([t_name, num]) => [this.mapName(t_name), num]).filter(([t_name]) => t_name);
        }

        return list.map(t_name => this.mapName(t_name)).filter(Boolean);
    }

    sortNames(list) {
        const first = list[0];

        let dualStrList = false,
            dualNumList = false;

        let nameList = false,
            numStrList = false;

        if (Array.isArray(first)) {
            const num = first[1];

            if (typeof num === "string") {
                dualStrList = true;
            } else {
                dualNumList = true;
            }
        } else if (typeof first === "string") {
            if (first.startsWith(this.prefix)) {
                nameList = true;
            } else {
                numStrList = true;
            }
        }

        if (dualStrList) {
            list = list.map(([t_name, numStr]) => [t_name, numStr, parseInt(numStr, 10)]);
        } else if (nameList) {
            list = list.map(t_name => [t_name, this.getNumber(numStr)]);
        } else if (numStrList) {
            list = list.map(numStr => [numStr, parseInt(numStr, 10)]);
        }

        if (dualStrList) {
            list.sort((a, b) => a[3] - b[3]);
            list = list.map(elem => elem.slice(0, 2));

            return list;
        } else if (dualNumList) {
            list.sort((a, b) => a[1] - b[1]);
            return list;
        } else if (nameList || numStrList) {
            list.sort((a, b) => a[1] - b[1]);
            list = list.map(elem => elem[0]);

            return list;
        }

        list.sort((a, b) => a - b);
        return list;
    }

    getTags() {
        if (typeof this.tags === "undefined") {
            this.tags = util.dumpTags();
        }

        return this.tags;
    }

    getValidTags(parseNums = true) {
        let list = this.getTags()
            .filter(t_name => t_name.startsWith(this.prefix))
            .map(t_name => [t_name, this.getNumStr(t_name)])
            .filter(([_, numStr]) => Contraptions.numExp.test(numStr));

        if (parseNums) {
            list = list.map(([t_name, numStr]) => [t_name, parseInt(numStr, 10)]);
        }

        return list;
    }

    getNumStr(name) {
        return name.slice(this.prefix.length);
    }

    getPrefixStr(n) {
        return this.prefix + n.toString(10);
    }
}

const t_name = msg.content.split(" ")[1],
    usage = `Usage: %t ${t_name} \`[number/random/list/count/next/latest/find]\``;

const contraptions = new Contraptions({
    nameMap
});

function getContraption(input) {
    switch (input) {
        case "":
        case "1":
            return og;
    }

    if (Contraptions.numExp.test(input)) {
        const n = parseInt(input, 10);

        if (isNaN(n)) {
            out = ":warning: Invalid contraption.\n" + usage;
        }

        const contraption = contraptions.get(n);

        if (typeof contraption === "undefined") {
            return `:warning: Contraption **${n}** doesn't exist.`;
        }

        return contraption;
    }

    return false;
}

function getOption(input) {
    switch (input) {
        case "r":
        case "rand":
        case "random":
            return contraptions.getRandom();
        case "list":
            const list = contraptions.getList().join("\n");

            msg.reply({
                file: {
                    name: "contraptions.txt",
                    data: "Contraptions:\n" + list
                }
            });

            return;
        case "count":
            const count = contraptions.getCount();
            return `:information_source: There are **${count}** contraptions.`;
        case "next":
            const next = contraptions.getNext();
            return `:information_source: Next contraption: **${next}**`;
        case "latest":
            const latest = contraptions.getLatest();

            let out = `:information_source: Latest contraption: **${latest}**\n\n`;
            out += contraptions.get(latest);

            return out;
        // case "find":
        //     const url = Util.splitStr(input)[1];
    }

    return false;
}

(_ => {
    const input = Util.splitStr(tag.args || "");

    let out = getContraption(input);

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
