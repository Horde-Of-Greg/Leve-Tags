
const data = http.request({
    url: "https://files.catbox.moe/l0n741.png",
    responseType: "arraybuffer"
}).data;

msg.reply("Because GregTech: New Horizons is the most modpack, a true Gregic experience that cannot be mirrored by any other pack. It's primary mechanic, Waiting, pushes players to the edge of their sanity and through it's beauty makes them build ever expanding shrines to it, the fabled Factory. Nomifactory, in contrast to GregTech: New Horizons is not embued with Waiting, thus it demands a lesser Factory, but it can still make a player appreciate the holy design of GregoriusT.", {
    file: {
        name: "thewait.png",
        data
    }
});
