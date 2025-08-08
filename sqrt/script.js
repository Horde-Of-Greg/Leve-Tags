
function susfunc(a, b) {
    return sus.includes(a.toLowerCase()) || sus.includes(b.toLowerCase());
}

const sus = ["sus", "amogus", "mogus", "susso", "amonga", "sussolini", "mega sus", "impostor", "imposter", "sussy", "cyc", "сус", "amoryc", "амогус", "susland"];

const regex1 = /([\"'])((?:\\\1|.)*?)\1\s*===?\s*([\"'])((?:\\\3|.)*?)\3/g,
      regex2 = /([\"'])((?:\\\1|.)*?)\1\s*!===?\s*([\"'])((?:\\\3|.)*?)\3/g;

let code = tag.args;
const start = code.indexOf("\`\`\`");

if(start != -1 && code.slice(-3) == "\`\`\`") {
    code = code.slice(start + 3, -3);
    if(code.slice(0, 3) == "js\n") {
        code = code.slice(3);
    }
}

let match;

while(match = regex2.exec(code)) {
    code = code.replace(match[0], !susfunc(match[2], match[4]));
}

while(match = regex1.exec(code)) {
    code = code.replace(match[0], susfunc(match[2], match[4]));
}

const out = eval(code);

if(typeof out != "undefined") {
    msg.reply(out.toString());
}
