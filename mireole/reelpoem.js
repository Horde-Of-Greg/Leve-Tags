
util.executeTag("has_krill_issue");
const text = util.fetchTag("reelpoem_").body;

msg.reply({
  embed: {
    description: text,
  },
});
