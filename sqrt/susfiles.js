
const humongus = ["https://cdn.discordapp.com/attachments/781499018253434924/1050024298343039016/sugus.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024298682785792/interesting6.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024377095299122/da_2.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024377456017499/interesting.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024377753800726/interesting2.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024494930067517/amuomgus.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024495240454224/among_us_drip_reversed.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024536625643520/amogus.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024536965398538/amogus4.mp3", "https://cdn.discordapp.com/attachments/781499018253434924/1050024537263190067/amogus5.mp3"];

const url = humongus[~~(Math.random() * humongus.length)],
      data = http.request({
    url: url,
    responseType: "arraybuffer"
}).data,
      name = url.match(/.+\/(.+)/)[1];

msg.reply(":warning: WARMING: Some of these are extremely loud.", {
    file: {
        name: name,
        data: data
    }
});