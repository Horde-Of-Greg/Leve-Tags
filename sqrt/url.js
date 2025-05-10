if(msg.attachments.length === 0) {
    ":information_source: Add an image to get it's url.";
} else {
    "_ _ " + msg.attachments.map(a => a.url).join("\n");
}
