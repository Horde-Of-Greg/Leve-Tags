
function getTagBody(tagName) {
  var tag = util.fetchTag(tagName);
  var tagBody = tag.body;
  return tagBody;
}

msg.reply(getTagBody("kriii"));
