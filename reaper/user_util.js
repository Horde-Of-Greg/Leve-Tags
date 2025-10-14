function getTargets() {
    return {
        message: getTargetMessage(),
        user: getTargetUser()
    };
};

function getTargetMessage() {
    var message = undefined;
    if (msg.reference != null) {
        util.fetchMessages().forEach(function(msg1, index) {
            if (msg1.id == msg.reference.messageId) {
                message = msg1;
            }
        });
    }
    else {
        message = util.fetchMessages(msg.channel.messages.slice(-1)[0])[0];
    }
    return message;
}

function getTargetUser(msg) {
    if (!util.findUsers) util.findUsers = ignored => [msg.author];
    let user;
    if (msg.mentions?.repliedUser) {
      let matches = util.findUsers(msg.mentions.repliedUser);
      if (matches.length) user = matches[0];
    } else {
      user = util.findUsers(util.fetchMessages(msg.channel.messages.slice(-1)[0])[0].authorId)[0];
    }
    if (!user) user = msg.author;
    return user;
}

function getRepliedMessage() {
    if (msg.reference != null) {
        util.fetchMessages().forEach(function(msg1, index) {
            if (msg1.id == msg.reference.messageId) {
                return msg1;
            }
        });
    }
    else {
        return null;
    }
}

function getRepliedUser(msg) {
    if (msg.mentions?.repliedUser) {
      let matches = util.findUsers(msg.mentions.repliedUser);
      if (matches.length) return matches[0];
    } else {
        return null;
    }
}

function isWhitelisted(user) {
    let whitelist = [
        // ["     User ID      "]        name
            "476161490815287306",     // MkcTao
            "688439290035830810",     // Mireole
            "858048708377182218",     // Svamp
            "280486590780932096",     // Gregmeister
            "276585037388972032",     // ADDION
            "539917854770987018",     // ofavor
            "325625714550374410",     // Reel
            "1268965187935797248",    // SexyBot
            "900856671973306398",     // Dan
            "382758037334786048",     // JustNotPro
            "227245431891951635",     // Rusted
            "423248971998429184",     // Hyperiif
            "436097109352251394",     // Alper Celik
            "517344602068615199",     // BuilderMan
            "1192128065275449414",    // SmallMing
            "517023348513964043",     // BoulesDeFromages
            "1221904268013994080",    // Testusername
            "824722371201335338",     // MookySpan
            "1171816694851833919",    // Kim
            "673522905836945455",     // EclipsedReaper
    ];
    var isWhitelisted = (whitelist.includes(user.id));
    if (isWhitelisted) return true; else return false;
}

module.exports = {
    getTargets,
    getTargetMessage,
    getTargetUser,
    getRepliedMessage,
    getRepliedUser,
    isWhitelisted
}



