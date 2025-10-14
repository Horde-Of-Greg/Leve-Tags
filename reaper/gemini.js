util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const {getRepliedUser, getTargetMessage} = ModuleLoader.loadModuleFromTag("user_util");

const user = msg.author;
let content = msg.content.slice(10);

const reply_user = getRepliedUser(msg);
let reply_content = getTargetMessage();
if (reply_content) reply_content = reply_content.content;

let message = "";

if (reply_user) {
    message = "User " + user.username + ": " + content + "\nUser " + user.username + " replied to " + reply_user.username + ", who said " + reply_content;
} else {
    message = "User " + user.username + ": " + content;
};

const res = http.request({
    method: "POST",
    url: "https://leveret-incorrectify.up.railway.app/gemini",
    headers: { "Content-Type": "application/json" },
    data: { text: message },
    responseType: "json"
});

const response = res.data?.text || "⚠️ AI did not respond.";
const geminiPfp = "https://cdn.discordapp.com/attachments/1000062774694645791/1405323293581508648/gemini_logo.png?ex=689e68ce&is=689d174e&hm=f13a232a1dc91730f8818ee46f56917b0da161968886653985ada1db1f3f2801&";

msg.reply({
    embed: {
        author: {
            name: "Gemini",
            icon_url: geminiPfp,
        },
        description: response,
    },
});
