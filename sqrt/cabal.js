
const data = http.request({
    url: "https://drive.google.com/uc?export=download&id=17pJpTeIY3PdLy8AOUthlwzFqIzeu1qxb",
    responseType: "arraybuffer"
}).data

msg.reply({
    file: {
        name: "cabal.mp4",
        data: data
    }
});
