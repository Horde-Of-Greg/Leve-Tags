const api = "https://e1kf0882p7.execute-api.us-east-1.amazonaws.com/default/latex2image",
      scales = ["10%", "25%", "50%", "75%", "100%", "125%", "150%", "200%", "500%", "1000%"];

function getImgData2(code, scale) {
    
    const res = http.request({
        url: api,
        method: "post",
        data: {
            latexInput: code,
            outputFormat: "PNG",
            outputScale: scale
        },
        validateStatus: null
    }).data;

    if(res.error !== null) {
        throw new Error("Error encountered while rendering: " + res.error);
    }

    return http.request({
        url: res.imageUrl,
        responseType: "arraybuffer"
    }).data;
}

(() => {
    const help = `MOGLIKE TeX rendering by Susso
Usage: %t latex -s (optional scale) \`code\`
Allowed scales: ${scales.join(", ")}`,
          usage = "\nSee %t latex -help for usage.";

    if(typeof tag.args === "undefined") {
        return "⚠️ Invalid arguments." + usage;
    }

    if(["-help", "-h", "help"].includes(tag.args.split(" ")[0])) {
        return help;
    }

    const bt1 = tag.args.indexOf("\`"),
          bt2 = tag.args.indexOf("\`", bt1 + 1);

    if(bt1 === -1 || bt2 === -1) {
        return "⚠️ Code must be enclosed in single backticks." + usage;
    } else if(bt1 === bt2) {
        return "⚠️ No code found." + usage;
    }
    
    const code = tag.args.slice(bt1 + 1, bt2),
          args = tag.args.slice(0, bt1),
          split = args.split(" "),
          scale_i = split.indexOf("-s");
  
    let scale = "125%";

    if(scale_i !== -1) {
        scale = split[scale_i + 1];

        if(!scales.includes(scale)) {
            return "⚠️ Invalid scale parameter: " + scale + usage;
        }
    }
    
    try {
        const data = getImgData2(code, scale);

        msg.reply({
            file: {
                data: data,
                name: "morbius.png"
            }
        });
    } catch(err) {
        throw err;
        return "⚠️ Stop doing cursed shit <\:trolllaugh\:924906915098681345>";
    }
})();