const now = Date.now();
const delay_min = 15;
const delay_ms = delay_min * 60 * 1000;
const delay_ago = now - delay_ms;

const ids = new Set(
  util
    .fetchMessages()
    .filter((x) => x.authorId)
    .filter((x) => x.createdTimestamp > delay_ago)
    .filter((x) => x.author !== "708269782482550814") // leveret
    .map((x) => x.authorId)
);
const booleanToResponse = {
  true: "I'm a real, verified, HOGger",
  false: "I'm a fake, impostor, HOGger",
};
const hogList = http.request("http://37.27.220.107:3002/data/members/ids").data
  .members;

let idsToHog = new Map();

ids.forEach((id) => {
  if (!idsToHog.has(id)) {
    const isHog = hogList.includes(id);
    idsToHog.set(id, isHog);
  }
});

let hogsAmount = 0;
let nonsAmount = 0;
let hogsBody = "";
let nonsBody = "";

idsToHog.forEach((value, key) => {
  if (value) {
    hogsAmount += 1;
    hogsBody += `\n- ${util.findUsers(key)[0].displayName}`;
  } else {
    nonsAmount += 1;
    nonsBody += `\n- ${util.findUsers(key)[0].displayName}`;
  }
});
if (hogsAmount === 0) hogsBody = "No HOG in chat :(";
if (nonsAmount === 0) hogsBody = "ONLY HOG IN CHAT";

let title = "";
let color = 0x000000;
if (hogsAmount - nonsAmount > 0) {
  title = `HOG Dominates ${hogsAmount} to ${nonsAmount}`;
  color = 0x00ff00;
} else {
  title = `HOG is losing ${hogsAmount} to ${nonsAmount}`;
  color = 0xff0000;
}

msg.reply({
  embed: {
    author: {
      name: "HOGi-Chan",
      icon_url:
        "https://cdn.discordapp.com/attachments/1281892034113966091/1419093147061059727/hogi-chan-square.png?ex=68d080fb&is=68cf2f7b&hm=89a152cbe9829bc7004366192ce0ebb4e91491bcbf3f51e7911ad606462029b1&S",
    },
    title: title,
    fields: [
      {
        name: "Hogs List",
        value: hogsBody,
      },
      {
        name: "Nons List",
        value: nonsBody,
      },
    ],
    color: color,
  },
});
