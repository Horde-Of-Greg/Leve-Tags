const DiscordUtil = {
    getIds: (msg) => {
        return [
            msg.channel ? msg.channel.id : msg.channel_id,
            msg.id
        ];
    }
};

class DiscordError extends Error {
    constructor(message) {
        super(message);
        this.name = "DiscordError";
    }
}

class DiscordHttpClient {
    constructor(config = {}) {
        this.config = config;
        
        this.api = config.api || "https://discord.com/api/v9";
        this.fetchParams = ["limit", "before", "around"];
        
        if(typeof config.apiReq !== "undefined") {
            this.apiReq = config.apiReq;
        } else if(typeof config.token === "undefined") {
            throw new DiscordError("No token provided.");
        }
    }
    
    apiReq(url) {
        return http.request({
            url: `${this.api}/${url}`,
            method: "get",
            headers: {
                authorization: this.config.token
            }
        });
    }
    
    fetchMessages(ch_id, options = {}) {
        options.limit = options.limit || 100;
        
        let query = [];
    
        this.fetchParams.forEach(x => {
            if(typeof options[x] !== "undefined") {
                query.push(x + "=" + encodeURIComponent(options[x]));
            }
        });
        
        query = query.join("&");
        
        try {
            return this.apiReq(`channels/${ch_id}/messages?${query}`).data;
        } catch(err) {
            if(err.message === "Request failed with status code 404") {
                throw new DiscordError(`Invalid channel ${ch_id}, status 404.`);
            } else if(err.message === "Request failed with status code 401") {
                throw new DiscordError("Provided token was rejected.");
            }
            
            throw err;
        }
    }
    
    fetchMessage(ch_id, id) {
        const msg = this.fetchMessages(ch_id, {
            around: id,
            limit: 1
        })[0];
        
        if(typeof msg === "undefined") {
            throw new DiscordError(`Message ${id} not found.`);
        }
        
        return msg;
    }
    
    fetchComplete(msg) {
        return this.fetchMessage(...DiscordUtil.getIds(msg));
    }
    
    fetchReply(msg) {
        const repl = this.fetchComplete(msg).referenced_message;
        
        if(typeof repl === "undefined") {
            throw new DiscordError("Message is not a reply.");
        }
        
        return this.fetchComplete(repl);
    }
    
    fetchMatch(msg, exp, options = {}) {
        const msgs = this.fetchMessages(msg.channel.id, options);

        for(let i = 0; i < msgs.length; i++) {
            const x = msgs[i];
        
            if(exp.test(x.content) &&
                x.id !== msg.id) {
                return x;
            }
        }
    }
}

const help = `Introducing SED2 by UngurMan1992!
---*SED2, like SED but better*---

Usage: 
    1. %t sed2 regex/replace/flags
         Replaces most recent message which matches the regex
  OR
    2. reply --> %t sed2 regex/replace/flags
         Replaces specifically the replied message
  OR
    3. reply to attachment --> %t sed2 regex/replace/flags
         Replaces text inside the attachment, returns file
Examples:
    1. %t sed2 based/sus
       in: hes so based
       out: hes so sus

    2. %t sed2 ./amogus /g
       in: play gtnh
       out: amogus amogus amogus amogus amogus amogus amogus amogus amogus

    3. %t sed2 ^S(.)([a-i|t|\s])+(.).+?((?<=w).)\D+?r(.){3}.+?(\s)(?=t)(([e-t]+).{3}(.)(.).\w+\W)\w+\s.(.).+(.an([a-d|\s])+.+$)/$7$11$2$5$3$6$8$6$9$1$4$13$2$10$12
       in: So either modded will remain fragmented or the devs will see the light and backport to 1.12
       out: the devs will hear the voices and backport to 1.12

Advantages of SED2:
    - g
    
Order SED2 now at http://www.apulis.ru/products/sed2`,
     usage = `\nSee "%t sed2 help" for usage.`;

(() => {
    const parts = (tag.args || "").split(/(?<!\\)\//);

    if(["help", "-help", "usage", "-usage", "-h", "--help"].includes(parts[0])) {
        return help;
    }

    if(typeof tag.args === "undefined" ||
       parts.length > 3 ||
       !tag.args.includes("/")) {
        return ":warning: Encountered invalid args." + usage;
    }
    
    const flag = parts[2] || "m";
    let regex;
    
    try {
        regex = new RegExp(parts[0], flag);
    } catch(err) {
        return ":warning: Invalid regex or flags." + usage;
    }

    let msg2;
    const client = new DiscordHttpClient({
        token: ""
    });
    
    try {
        if(msg.type === "REPLY") {
            msg2 = client.fetchReply(msg);
        } else {
            msg2 = client.fetchMatch(msg, regex);
        
            if(typeof msg2 === "undefined") {
                return ":warning: No matching message found." + usage;
            }
        }
    } catch(err) {
        return `:warning: Fetching message failed: "${err.message}"`;
    }

    let torepl, isAttach = msg2.attachments.length > 0 && msg2.attachments[0].content_type.startsWith("text/plain");
    
    if(isAttach) {
        try {
            torepl = http.request(msg2.attachments[0].url).data;
        } catch(err) {
            return `:warning: Fetching attachment failed: "${err.message}"`;
        }
    } else {
        torepl = msg2.content;
    }
    
    const replaced = torepl.replace(regex, parts[1] || ""),
          reply = {};
          
    if(isAttach) {
        reply.file = {
            name: "sed2.txt",
            data: replaced
        };
    } else {
        reply.embed = {
            author: {
                name: msg2.author.username,
                icon_url: `https://cdn.discordapp.com/avatars/${msg2.author.id}/${msg2.author.avatar}.webp`
            },
            description: replaced,
            footer: {
                text: "sed2 replace in #" + msg.channel.name
            },
            timestamp: new Date().getTime()
        };
    }
    
    msg.reply(reply);
})();
