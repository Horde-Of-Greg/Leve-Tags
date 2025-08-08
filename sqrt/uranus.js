
const data = http.request({
    url: "https://i.ibb.co/gRQhcjF/PIA18182-1.jpg",
    responseType: "arraybuffer"
}).data;

msg.reply("Uranus", {
    file: {
        name: "uranus.jpg",
        data: data
    }
});

