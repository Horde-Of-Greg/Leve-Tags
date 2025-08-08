
let url = "";
let data = http.request(url).data;
let chapters = data.split("ඞ ");

if(!tag.args) {
    msg.reply("ඞ " + chapters[0]);
} else {
    let num = parseInt(tag.args);
    if(![0, 1, 2, 3, 4, 5, 6, 7, 8].includes(num)) {
        msg.reply(`Invalid chapter: ${num}. Usage: %t sushistory [chapter 0-8]`);
    } else {
        msg.reply("ඞ " + chapters[num]);
    }
}
