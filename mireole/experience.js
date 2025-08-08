
util.executeTag("has_krill_issue");
const text = util.fetchTag("experience_").body.replaceAll("Haskell", tag.args || "EnderIO");

msg.reply({
  embed: {
    description: text,
  },
});
