
function encode(str) {
    const last = BigInt(str.length * 8);

    let n = 0n;

    let i = 0,
        j = last - 8n;

    for (; i < str.length; i++) {
        n += BigInt(str.charCodeAt(i)) << j;
        j -= 8n;
    }

    return n + (1n << last);
}

function decode(n) {
    let m = n,
        len = 0n;

    while (m > 1n) {
        m >>= 1n;
        len++;
    }

    const last = len;
    len /= 8n;

    n -= 1n << last;

    let str = "",
        i = 0;

    for (; i <= len; i++) {
        str = String.fromCharCode(Number(n & 255n)) + str;
        n >>= 8n;
    }

    return str;
}

function getAttachment() {
    if (!msg.attachments[0].contentType.includes("text/plain")) {
        return ["", "Invalid file type."];
    }

    const url = msg.attachments[0].url;
    let data = "";

    try {
        data = http.request({
            url,
            responseType: "text"
        }).data;
    } catch (err) {
        return ["", "Download failed."];
    }

    return [data];
}

const i = (tag.args || "").indexOf(" "),
    option = (tag.args || "").split(" ")[0];

let out = "";

switch (option) {
    case "-help":
        out = `zZ_SexM4ESTR0_Zz's cursed encoder. Output in Hungarian.

Encode: %t sexcode (string)
Decode: %t sexcode -d (hungarian number)`;
        break;
    case "-d": {
        let n, err;

        if (msg.attachments.length > 0) {
            [n, err] = getAttachment();
        } else {
            n = tag.args.slice(i + 1, tag.args.length);
        }

        if (typeof err !== "undefined") {
            out = err;
            break;
        }

        if (typeof n === "undefined" || n.length == 0) {
            out = "Empty string. See %t sexcode -help";
            break;
        }

        try {
            n = BigInt(n);
        } catch (err) {
            out = `Invalid number: ${n}. See %t sexcode -help`;
            break;
        }

        out = decode(n);
        break;
    }
    default: {
        let str, err;

        if (msg.attachments.length > 0) {
            [str, err] = getAttachment();
        } else {
            str = tag.args;
        }

        if (typeof err !== "undefined") {
            out = err;
            break;
        }

        if (typeof str === "undefined" || str.length == 0) {
            out = "Empty string. See %t sexcode -help";
            break;
        }

        out = encode(str).toString(10);
        break;
    }
}

out;

