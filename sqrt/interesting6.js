
const data = http.request({
    url: "https://files.catbox.moe/hgnrsx.mp3",
    responseType: "arraybuffer"
}).data;

msg.reply("earrape", {
    file: {
        name: "interesting6.mp3",
        data: data
    }
});

