const CONFIG = {
    goodWords: ["tao", "hog", "pex"],
    badWords: ["conduit", "conduits"],
    storage: {
        occurences: {
            prefix: "tao_s_bwcm-",
            amount: 6,
        },
        stopWords: {
            prefix: "tao_s_bcsw",
            amount: 1,
        },
    },
    constants: {
        score: {
            bonus: 1,
        },
    },
    formatting: {
        responseName: "God",
        responsePfp:
            "https://cdn.discordapp.com/attachments/1266376637876928696/1362133906786357589/cat.png?ex=6801498e&is=67fff80e&hm=1ec6784bfdafb2856ccccf904b58e540340d1efc5e3f9229e7158ea6719dcc9b&",
        colors: {
            good: 0x02fc06,
            normal: 0xbdfc02,
            bad: 0xfcb902,
            awful: 0xfc0a02,
        },
        conclusions: {
            perfect: "Perfectly holy. You cheated.",
            good: "Holy. You are a good person. Continue writing like this.",
            normal: "Somewhat holy. You are a good person.",
            bad: "Somewhat unholy. You are a bad person.",
            awful: "Damnation. Get out of this server. You will burn in hell.",
        },
    },
};

class HolinessCalculator {
    totalWords = 0;
    occurencesMap = new Map();
    stopWords = [];
    message = "";

    constructor(message) {
        this.message = message;
        this.parseOccurences();
        this.parseStopWords();
    }

    /**
     * The main method for Holiness Calculator. Evaluates the "holiness" of a string.
     * @returns {number} - A ratio between 0 and 1. 1 being the most holy, 0 being the least holy.
     */
    calcHoliness() {
        let runningScore = 0;
        let realWordsCount = 0;
        const words = this.message.split(" ");

        for (const word of words) {
            const sanitizedWord = this.sanitizeWord(word);

            if (CONFIG.goodWords.includes(sanitizedWord)) return 1;
            if (CONFIG.badWords.includes(sanitizedWord)) return 0;

            if (this.stopWords.includes(sanitizedWord)) continue;

            runningScore += this.calcScore(sanitizedWord);
            realWordsCount++;
        }

        const optimalMessageScore = this.optimalScore * realWordsCount;
        if (optimalMessageScore <= 0) return 0;

        return runningScore / optimalMessageScore;
    }

    fetchFromTags(CONFIG) {
        if (CONFIG.amount === 1) return util.fetchTag(CONFIG.prefix).body;

        const buffer = [];
        for (let i = 1; i < CONFIG.amount; i++) {
            buffer.push(util.fetchTag(CONFIG.prefix + i).body);
        }
        return buffer.join("\n");
    }

    parseOccurences() {
        const rawMap = this.fetchFromTags(CONFIG.storage.occurences);

        for (const line of rawMap.split("\n")) {
            const [key, value] = line.split(" ");
            this.occurencesMap.set(this.sanitizeWord(key), parseInt(value));
            this.totalWords += parseInt(value);
        }
    }

    parseStopWords() {
        const rawList = this.fetchFromTags(CONFIG.storage.stopWords);

        for (const line of rawList.split("\n")) {
            this.stopWords.push(this.sanitizeWord(line));
        }
    }

    /**
     * Calculates the score of a word based on the formula `-ln(1/a) + ln(b/a) + k` with:
     * - a: the sum of the occurences in the occurences map
     * - b: this word's occurences
     * - k: a raw bonus
     * @param {string} word - The word to evaluate the score of.
     * @returns {number} The score of the word
     */
    calcScore(word) {
        const occurences = this.occurencesMap.get(word);

        if (!occurences) return 0;

        const minLogRatio = Math.log(1 / this.totalWords);
        const thisLogRatio = Math.log(occurences / this.totalWords);

        return -minLogRatio + thisLogRatio + CONFIG.constants.score.bonus;
    }

    sanitizeWord(word) {
        return word.replace(/\s/g, "").toLowerCase();
    }

    /**
     * @returns {number} - The best possible score a word could have
     */
    get optimalScore() {
        return this.calcScore(this.optimalWord);
    }

    /**
     * @returns {string} - The word with the most occurences according to the map
     */
    get optimalWord() {
        let bestWord = "";
        let bestOccurences = 0;

        for (const [word, occurences] of this.occurencesMap.entries()) {
            if (occurences > bestOccurences) {
                bestWord = word;
                bestOccurences = occurences;
            }
        }

        return bestWord;
    }
}

let message = undefined;
if (msg.reference !== null) {
    for (const messageInChannel of util.fetchMessages()) {
        if (messageInChannel.id === msg.reference.messageId) message = messageInChannel;
    }
} else {
    message = util.fetchMessages(msg.channel.messages.slice(-1)[0])[0];
}
const user = util.findUsers(message.authorId)[0];

const holinessCalculator = new HolinessCalculator(message.content);
const holiness = holinessCalculator.calcHoliness();

function buildFormatting(score) {
    if (score === 1) {
        return [CONFIG.formatting.colors.good, CONFIG.formatting.conclusions.perfect];
    }

    if (score > 0.8) {
        return [CONFIG.formatting.colors.good, CONFIG.formatting.conclusions.good];
    }

    if (score > 0.5) {
        return [CONFIG.formatting.colors.normal, CONFIG.formatting.conclusions.normal];
    }

    if (score > 0.25) {
        return [CONFIG.formatting.colors.bad, CONFIG.formatting.conclusions.bad];
    }

    return [CONFIG.formatting.colors.awful, CONFIG.formatting.conclusions.awful];
}
const [messageColor, messageConclusion] = buildFormatting(holiness);

msg.reply({
    embed: {
        author: {
            name: CONFIG.formatting.responseName,
            icon_url: CONFIG.formatting.responsePfp,
        },
        color: messageColor,
        title: `${user.displayName}'s Holiness`,
        description:
            `${user.displayName}'s holiness is ` + (holiness * 100).toFixed(2) + "%.\n" + messageConclusion,
    },
});
