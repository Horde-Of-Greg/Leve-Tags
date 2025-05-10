const url = "https://iili.io/JEbs1tt.md.png";

if(tag.args) {
    const data = http.request({
        url,
        responseType: "arraybuffer"
    }).data,
        person = "Person below me " + tag.args.toUpperCase();

    msg.reply(person, {
        file: {
            name: "below.png",
            data: data
        }
    });
} else {
    url;
}
