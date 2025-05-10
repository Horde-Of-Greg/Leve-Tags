class DiscordRequestError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);

        this.name = "DiscordRequestError";
        this.message = message;
    }
}

const Util = {
    getQueryString: (options, params) => {
        const query = [];

        Object.keys(options).forEach(x => {
            if (params.includes(x)) {
                query.push(x + "=" + encodeURIComponent(options[x]));
            } else {
                throw new DiscordRequestError("Invalid query parameter: " + x);
            }
        });

        return query.join("&");
    },
    formatChannel: id => `<#${id}>`,
    round: (num, digits) => Math.round((num + Number.EPSILON) * 10 ** digits) / 10 ** digits,
    getIdFromDate: date => ((BigInt(date.getTime()) - 1420070400000n) << 22n).toString(),
    getPast: length => {
        const days = {
            day: 1,
            week: 7,
            month: 30,
            year: 365
        };

        const date = new Date();
        date.setDate(date.getDate() - days[length]);

        return date;
    }
};

class DiscordHttpClient {
    constructor(config = {}) {
        this.config = config;

        this.api = config.api || "https://discord.com/api/v9";
        this.searchParams = ["content", "author_id", "channel_id", "min_id"];

        if (typeof config.apiReq !== "undefined") {
            this.apiReq = config.apiReq;
        } else if (typeof config.token === "undefined") {
            throw new DiscordError("No token provided.");
        }
    }

    apiReq(url) {
        try {
            return http.request({
                url: `${this.api}/${url}`,
                method: "get",
                headers: {
                    "Accept-Encoding": "application/json",
                    authorization: this.config.token
                }
            });
        } catch (err) {
            if (err.message === "Request failed with status code 404") {
                throw new DiscordRequestError(`Invalid server ${sv_id}, status 404.`);
            } else if (err.message === "Request failed with status code 401") {
                throw new DiscordRequestError("Provided token was rejected.");
            }

            throw err;
        }
    }

    fetchSearch(sv_id, options = {}) {
        const query = Util.getQueryString(options, this.searchParams);

        return this.apiReq(`guilds/${sv_id}/messages/search?${query}`).data;
    }

    getChannels(sv_id) {
        const res = this.apiReq(`guilds/${sv_id}/channels`).data;

        return res
            .filter(x => x.type === 0)
            .map(x => ({
                id: x.id,
                name: x.name
            }));
    }

    getCounts(guildId, user, channel, content, minId) {
        let n1 = 0,
            n2 = 0,
            n1_req = {},
            n2_req = {};

        if (channel.name === "global" && typeof content === "undefined") {
            n1_req = {
                min_id: channel.min_id
            };

            n2_req = {
                author_id: user.userId
            };

            n1 = channel.count;
        } else if (channel.name === "global" && typeof content !== "undefined") {
            n2_req = {
                author_id: user.userId
            };
        } else {
            if (typeof channel.min_id !== "undefined" && typeof content === "undefined") {
                n1_req = {
                    channel_id: channel.id,
                    min_id: channel.min_id
                };

                n1 = channel.count;
            } else {
                n1_req = {
                    channel_id: channel.id
                };
            }

            n2_req = {
                channel_id: channel.id,
                author_id: user.userId
            };
        }

        if (typeof minId !== "undefined") {
            n1 = 0;
            n1_req.min_id = minId;
            n2_req.min_id = minId;
        }

        if (typeof content !== "undefined") {
            n1_req.content = content;
            n2_req.content = content;
        }

        n1 += this.fetchSearch(guildId, n1_req).total_results;
        n2 += this.fetchSearch(guildId, n2_req).total_results;

        return [n1, n2];
    }
}

const ch_sv = {
    "1162056243125432391": [
        {
            name: "global",
            count: 0,
            min_id: "0"
        },
        {
            id: "1162056243721031733",
            name: "general"
        },
        {
            id: "1164838382195724388",
            name: "quotes"
        },
        {
            id: "1165004200657293352",
            name: "circus"
        },
        {
            id: "1165207171965915268",
            name: "windows"
        },
        {
            id: "1165208683559522434",
            name: "contraptions"
        },
        {
            id: "1165320979896074384",
            name: "rules"
        },
        {
            id: "1176444263828037702",
            name: "next-pack-vote"
        },
        {
            id: "1177701319042150490",
            name: "the-zoo"
        },
        {
            id: "1177922667995725824",
            name: "flop"
        },
        {
            id: "1178649059800649819",
            name: "nomitardation"
        },
        {
            id: "1180131372027891783",
            name: "omni-ste"
        },
        {
            id: "1182261743938969600",
            name: "cat"
        },
        {
            id: "1187439363387314296",
            name: "dwagon-do-not-fuck-ralsei-2"
        },
        {
            id: "1190697379561738273",
            name: "la-deuxieme-cellule"
        },
        {
            id: "1193307863242784778",
            name: "pjtorio"
        },
        {
            id: "1193857210191724584",
            name: "zeldalord-give-me-a-task"
        },
        {
            id: "1196981595488407592",
            name: "you-make-even-the-devil-cry"
        },
        {
            id: "1202556019431972955",
            name: "t-iamlucky"
        },
        {
            id: "1205852270139543632",
            name: "no"
        },
        {
            id: "1207277814278127616",
            name: "introductions"
        },
        {
            id: "1207674716090015776",
            name: "sqrt-containment"
        }
    ]
};

function getChannelList(client, id) {
    const channels = client.getChannels(id),
        obj = {};

    obj[id] = channels;
    let list = JSON.stringify(obj, undefined, 4);
    list = "const ch_sv = " + list + ";";

    return list;
}

class OptionParserError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);

        this.name = "OptionParserError";
        this.message = message;
    }
}

const OptionTypes = {
    empty: 0,
    int: 1,
    float: 2,
    string: 3,
    array: 4,

    number: 5,
    any: 6,
    nonempty: 7,
    joined: 3
};

class Option {
    constructor(args = {}) {
        this.val = args.val;
        this.type = args.type || OptionTypes.any;

        this.required = args.required || false;
    }

    validate(option) {
        switch (this.type) {
            case OptionTypes.any:
                return true;
            case OptionTypes.nonempty:
                return option.type !== OptionTypes.empty;
            case OptionTypes.number:
                return [OptionTypes.int, OptionTypes.float].includes(option.type);
            default:
                if (this.type.constructor === Array) {
                    return this.type.includes(option.type);
                } else {
                    return this.type === option.type;
                }
        }
    }

    getTypeName() {
        if (this.type.constructor === Array) {
            return this.type.map(x => Object.keys(OptionTypes)[x]).join("or");
        }

        return Object.keys(OptionTypes)[this.type];
    }
}

class ArgsParser {
    constructor(prefix = "-") {
        this.prefix = prefix;

        this.optionsExp = new RegExp(`${prefix}([\\w|\\d]+)\\s*(.+?\\b\\W?(?=(?:\\s${prefix}|$)))?`, "g");
        this.argsExp = /"([^"\\]*(?:\\.[^"\\]*)*)"|[^\s]+/g;
    }

    parse(str, expect = {}) {
        let options = {},
            match;

        const expectNames = Object.keys(expect);

        this.optionsExp.lastIndex = 0;

        while ((match = this.optionsExp.exec(str))) {
            let name = match[1],
                val = match[2],
                type = OptionTypes.string;

            if (!val || !val.length) {
                val = undefined;
                type = OptionTypes.empty;
            } else if (!isNaN(val)) {
                val = Number(val);

                if (Math.floor(val) === val) {
                    type = OptionTypes.int;
                } else {
                    type = OptionTypes.float;
                }
            } else if (val.includes(" ") || val.includes('"')) {
                [val, type] = this.parseString(val, expect[name]);
            }

            options[name] = new Option({
                val,
                type
            });
        }

        expectNames.forEach(x => {
            const option = options[x],
                expected = expect[x];

            if (typeof option !== "undefined") {
                if (!expected.validate(option)) {
                    const type = expected.getTypeName();
                    throw new OptionParserError(`Option ${this.prefix}${x} is invalid. Expected type ${type}.`);
                }
            } else if (expected.required === true) {
                throw new OptionParserError(`Required option ${this.prefix}${x} not found`);
            }
        });

        return options;
    }

    parseString(str, expect) {
        let argsList = [],
            match;

        if (typeof expect !== "undefined" && expect.type === OptionTypes.joined) {
            return [str, OptionTypes.joined];
        }

        this.argsExp.lastIndex = 0;

        while ((match = this.argsExp.exec(str))) {
            if (match[1]) {
                argsList.push(match[1].replace('\\"', '"'));
            } else {
                argsList.push(match[0]);
            }
        }

        if (argsList.length === 1) {
            return [argsList[0], OptionTypes.string];
        } else {
            return [argsList, OptionTypes.array];
        }
    }
}

const validPast = ["day", "week", "month", "year"],
    help = `%t msgperc, see how much time you've wasted on Discord!
Shows percentage of messages you've sent in a channel.

Usage: %t msgperc -- show stats for current user in current channel
       %t msgperc -u username
                  -c channel
                  -p period
                  -h content

Valid periods are: ${validPast.join(", ")}
Use -c global to see messages in all channels.
       
Beware! "AMONG US" not included!
`,
    usage = "\nSee %t msgperc help for usage.";

(() => {
    const parts = (tag.args || "").split(" ");

    if (["help", "-help", "usage", "-usage", "--help"].includes(parts[0])) {
        return help;
    }

    const client = new DiscordHttpClient({
            token: ""
        }),
        channels = ch_sv[msg.guildId];

    let user, channel, minId, content, past;

    if (typeof tag.args !== "undefined") {
        let options;

        try {
            options = new ArgsParser().parse(tag.args, {
                u: new Option({
                    type: OptionTypes.string
                }),
                c: new Option({
                    type: [OptionTypes.string, OptionTypes.int]
                }),
                p: new Option({
                    type: OptionTypes.string
                }),
                h: new Option({
                    type: OptionTypes.joined
                }),
                l: new Option({
                    type: OptionTypes.empty
                })
            });
        } catch (err) {
            if (err.name === "OptionParserError") {
                return "⚠️ " + err.message + usage;
            }

            throw err;
        }

        if (msg.guildId === "701354865217110096") {
            return "no msgperc for you, fuck off";
        } else if (typeof channels === "undefined") {
            return "⚠️ Unsupported server." + usage;
        }

        if (typeof options["l"] !== "undefined") {
            const list = getChannelList(client, msg.guildId);

            msg.reply({
                file: {
                    name: "channels.js",
                    data: list
                }
            });

            return;
        }

        if (typeof options["u"] !== "undefined") {
            const u = options["u"].val,
                find = util.findUsers(u);

            if (find.length === 0) {
                return `⚠️ No users with name "${u}" found.` + usage;
            }

            user = find[0];
        }

        if (typeof options["c"] !== "undefined") {
            const c = options["c"].val;

            let find,
                match = c.match(/<#([0-9]{18})>/);

            if (match) {
                find = channels.filter(x => x.id === match[1]);
            } else {
                find = channels.filter(x => x.name == c);
            }

            if (find.length < 1) {
                return `⚠️ No channel with name "${c}" found.` + usage;
            }

            channel = find[0];
        }

        if (typeof options["p"] !== "undefined") {
            const p = options["p"].val;

            if (!validPast.includes(p)) {
                return `⚠️ Invalid period: "${p}". Valid periods are: ${validPast.join(", ")}` + usage;
            }

            past = p;
            minId = Util.getIdFromDate(Util.getPast(p));
        }

        if (typeof options["h"] !== "undefined") {
            content = options["h"].val;
        }
    }

    if (typeof user === "undefined") {
        user = {
            userId: msg.authorId,
            username: msg.author.username
        };
    }

    if (typeof channel === "undefined") {
        channel = channels.filter(x => x.id === msg.channelId)[0];
    }

    const [n1, n2] = client.getCounts(msg.guildId, user, channel, content, minId),
        perc = Util.round((n2 / n1) * 100, 2);

    let out = `ℹ️ User \`${user.username}\` has sent ${perc}% of all messages`;

    if (typeof content !== "undefined") {
        out += ` containing "${content}"`;
    }

    if (channel.name !== "global") {
        out += ` in ${Util.formatChannel(channel.id)}`;
    }

    if (typeof past !== "undefined") {
        out += ` in the past ${past}`;
    }

    return out + `. (${n2.toLocaleString()} / ${n1.toLocaleString()})`;
})();
