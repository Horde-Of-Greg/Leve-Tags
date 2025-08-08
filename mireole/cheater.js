
util.executeTag("has_krill_issue");
const text = util.fetchTag("cheater_").body;

msg.reply({
  embed: {
    description: text,
  },
});
