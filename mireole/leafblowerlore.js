
util.executeTag("has_krill_issue");
const text = util.fetchTag("leafblowerjournal").body;

msg.reply({
  embed: {
    description: text,
  },
});
