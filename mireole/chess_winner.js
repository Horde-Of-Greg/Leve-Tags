
data = http.request("https://onemillionchessboards.com/api/global-game-stats").data;

const white = data.whiteKingsRemaining;
const black = data.blackKingsRemaining;

const diff =  Math.abs(white - black);
const perc = diff / Math.max(white, black) * 100;

const winner = white > black ? "White" : "Black"
msg.reply(`:information_source: **${winner}** is leading by **${diff.toLocaleString()}** kings (**${perc.toFixed(2)}%** advantage)`);
