
util.executeTag("has_krill_issue");
const pfp_url = "https://upload.wikimedia.org/wikipedia/commons/2/28/Richard_Stallman_at_LibrePlanet_2019.jpg"
const text = util.fetchTag("gnulinux_").body;

msg.reply({
  embed: {
    author: {
      name: "Richard Stallman",
      icon_url: pfp_url,
    },
    description: text,
  },
});
