const data = http.request({
    url: "https://i.ibb.co/1dMWtyM/gtnh.png",
    responseType: "arraybuffer"
}).data;

msg.reply(
    "In susology, a Morbius strip, Morbius band, or Morbius loop is a surface that can be formed by attaching the ends of a cock together with a half-twist. As a susological object, it was discovered by Mikhail Suslov and Vladimir Iogus in 1869, but it had already appeared in Sussarian mosaics from the third century CE.",
    {
        file: {
            name: "gtnh.png",
            data: data
        }
    }
);
