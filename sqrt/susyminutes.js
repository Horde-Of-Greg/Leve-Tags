const start = 1691499600000;
let n;

if(typeof tag.args === "undefined") {
    const diff = Date.now() - start;
    n = -Math.floor(diff / 60000);
} else {
    n = parseInt(tag.args) || 0;
}

"\`\`\`" + `can you believe it guys? :real:! Just ${n} minutes away! :real: is in ${n} minutes! Wohoo! I am so happy about this information! :real: just ${n} minutes away! Oh wow! Can you believe it? :real:! Just in ${n} minutes! It got here so fast!` + "\`\`\`";
