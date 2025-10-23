let prompt = tag.args;

var replyMessage = undefined;
if (msg.reference != null) {
  util.fetchMessages().forEach(function (msg1, index) {
    if (msg1.id === msg.reference.messageId) {
      replyMessage = msg1;
    }
  });
}

const allMsgs = util.fetchMessages(msg.channel.messages.slice(-1)[0]);
const lastMsg = allMsgs[0];

const promptAttachment = msg.attachments?.[0]?.url ?? null;
const txtContext = replyMessage ?? null;
const contextEmbed = replyMessage?.embeds?.[0] ?? null;
let context = "";
if (txtContext) {
  context = `User ${txtContext.authorId} wrote:${txtContext.cleanContent}`;
}

if (contextEmbed) {
  context = `User ${txtContext.author?.name ?? "undefined"} wrote:${
    txtContext.cleanContent
  }`;
}

const attachment = null;

/* Situations:
 * -2 - On a server that's not allowed
 * -1 - Error occurred
 * 0 - Regular prompt
 * 1 - Send Help string
 * 2 - Send Thought process
 */

let situation = undefined;

if (lastMsg.guildId === "701354865217110096") {
  situation = -2;
} else if (prompt == null || prompt.trim() === "") {
  situation = -1;
} else if (
  prompt
    .toLowerCase()
    .trim()
    .match(/^-?-?help$/i)
) {
  situation = 1;
} else if (prompt.toLowerCase().includes("--thought")) {
  prompt = prompt.replace(/--thought/g, "").trim();
  situation = 2;
} else {
  situation = 0;
}

let response;
let errored = false;
let errorCode = 200;
let errorMessage = "";
let replyImageURL = null;

if (situation !== 1 && situation !== -2) {
  try {
    response = http.request({
      url: "http://37.27.220.107:3002/leveret/premium-grok/nomicord",
      method: "POST",
      responseType: "json",
      data: {
        userId: msg.authorId,
        prompt: prompt,
        context: context,
        attachment: attachment,
      },
    });
  } catch (error) {
    errored = true;

    const match = error.message.match(/(\d+)/);
    errorCode = match ? parseInt(match[1], 10) : null;
    errorMessage = error.message;

    switch (errorCode) {
      case 37:
        response = `Error: The server is down. I'm probably editing the code right now. Try again in 30s`;
      case 400:
        response = `Error: Bad Request. Provide a prompt or make it shorter.`;
        break;
      case 404:
        response = `Error: Not Found. This shouldn't happen.`;
        break;
      case 429:
        response = `Error: Too Many Requests. You are being rate limited.`;
        replyImageURL =
          "https://cdn.discordapp.com/attachments/1268613021123608682/1405258117515837583/discord-rate-limited-discord.gif?ex=689e2c1b&is=689cda9b&hm=0e630c315885a3886181113877f78482e94cc457d7d7ccccd296f57eb9279662&";
        break;
      case 500:
        response = `Error: Internal Server Error, this shouldn't happen.`;
        break;
      case 10000:
        response = `Leveret timed out. Try again. ${error.message}`;
        break;
      default:
        response = `Unexpected Error: ${error.message}`;
        break;
    }
  }
}

if (errored) {
  situation = -1;
}

const grokPfp =
  "https://cdn.discordapp.com/attachments/1266376637876928696/1428896612125769855/Golden-grok.png?ex=68f42b2b&is=68f2d9ab&hm=df58b6c7c962ddc100ced3c777eb95c7d8b5d74d0384149885d39596fa9aea0d&";
let footerText = "";

switch (situation) {
  case -2:
    descriptionContent = "This command is not allowed on this server.";
    footerText = "Server Not Allowed";
    break;
  case -1:
    descriptionContent = response;
    footerText = `Error Code: ${errorCode ?? "Unknown"}`;
    break;
  case 0:
    descriptionContent = shortenTo30Lines(
      response.data.completion.choices[0].message.content
    );

    timeTaken = Math.round(response.data.duration);
    model = response.data.completion.model;
    footerText = `Time Taken: ${timeTaken}ms | Model: ${model} | Water Used: ${calcWaterEquivalent(
      response
    )}mB`;

    if (descriptionContent.match(/.*--navyseal.*/i)) {
      footerText += ` | Navy Seal Mode: Activated`;
      descriptionContent = util.fetchTag("navyseal").body;
    }

    break;
  case 1:
    descriptionContent = `# Usage information
### Flags
- \`-help\`: Show this help message (can't be used with anything else)
- \`--thought\`: Show the thought process (can be used with other flags and a prompt)

### How to use grok
1. (optional) Reply to another message to include it as context
2. (optional) Include additional flags as needed
3. Provide a prompt for the model to respond to

### Error codes:
- \`400\`: Bad Request: You probably didn't provide a prompt
- \`404\`: Not Found: This shouldn't happen
- \`429\`: Too Many Requests: You are being rate limited
- \`500\`: Internal Server Error: This is a skill issue on my end
- Timeout: This is most often a problem on the bot side, just try again.
`;
    footerText = "Called via -help";
    break;
  case 2:
    descriptionContent = shortenTo30Lines(
      response.data.completion.choices[0].message.reasoning_content
    );

    timeTaken = Math.round(response.data.duration);
    model = response.data.completion.model;
    footerText = `Time Taken: ${timeTaken}ms | Model: ${model} | Water Used: ${calcWaterEquivalent(
      response
    )}mB`;
    break;
  default:
    descriptionContent =
      "Uhhh, there seems to be an issue with the response. This shouldn't happen.";
    footerText = "Unknown Error";
    break;
}

msg.reply({
  embed: {
    author: {
      name: "Premium Grok",
      icon_url: grokPfp,
    },
    image: {
      url: replyImageURL,
    },
    description: descriptionContent,
    footer: {
      text: footerText,
    },
    color: 0x00ae86,
  },
});

function shortenTo30Lines(text) {
  const lines = text.split("\n");
  if (lines.length <= 30) return text;
  return lines.slice(0, 28).join("\n") + "\n...";
}

/* Calculate token to water equivalent
 * Hypothesis : GPT4 uses 500mL of water for 20 tokens.
 */

function calcWaterEquivalent(response) {
  const tokens = response.data.completion.usage.total_tokens;
  const grok3MiniWater = Math.ceil(((tokens / 20) * 500) / 1000);
  return grok3MiniWater;
}
