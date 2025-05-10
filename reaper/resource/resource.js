function embed_reply(text, name) {
    const embedToSend = {
        description: String(text).substring(0, 4096),
        color: 0x5865F2, 
    };
    if (name) {
        embedToSend.title = String(name).substring(0, 256);
    }
    if (!embedToSend.description && !embedToSend.title) {
        embedToSend.description = "(No content to display)";
    }
    if (embedToSend.title && !embedToSend.description) {
        embedToSend.description = "\u200B"; 
    }
    try {
        msg.reply({ embed: embedToSend }); 
    } catch (e2) {
        console.log("Embed reply {embed: embedObj} failed, trying direct object. Error: " + (e2.message || e2));
        try {
            msg.reply(embedToSend);
        } catch (e3) {
            console.log("All embed attempts failed. Falling back to plain text reply. Error: " + (e3.message || e3));
            let fallbackText = "";
            if (name) { fallbackText += `**${name}**\n`; }
            fallbackText += String(text);
            msg.reply(fallbackText.substring(0, 2000));
        }
    }
}

const rawArgs = (tag.args || "").trim();
let replied = false;


if (!rawArgs) {
    embed_reply("Usage:\n"
        + "   `%t resource <topic>`\n"
        + "   `%t resource suggest <slug> <body_text>`\n"
        + "   `%t resource edit <slug> <new_body_text>`\n"
        + "   `%t resource search <query>`",
        "❌ Incorrect Usage");
    replied = true;
}

if (!replied) {
    // Command logic
    let commandName = "";
    let actualSlug = "";
    let actualBody = "";
    let searchQueryText = "";
    let slugForReadOp = "";

    // Parse command name and arguments
    const firstSpaceIndex = rawArgs.indexOf(' ');
    if (firstSpaceIndex === -1) {
        commandName = rawArgs.toLowerCase();
        if (commandName !== "suggest" && commandName !== "edit" && commandName !== "search") {
            slugForReadOp = rawArgs;
            commandName = "read";
        }
    } else {
        commandName = rawArgs.substring(0, firstSpaceIndex).toLowerCase();
        let remainingArgsString = rawArgs.substring(firstSpaceIndex + 1).trim();

        if (commandName === "suggest" || commandName === "edit") {
            const slugParseMatch = remainingArgsString.match(/^(?:(?:"([^"]+)"|'([^']+)'|(\S+))\s*)?(.*)?$/s);
            if (slugParseMatch) {
                actualSlug = slugParseMatch[1] || slugParseMatch[2] || slugParseMatch[3] || "";
                actualBody = (slugParseMatch[4] || "").trim();

                if ((actualSlug.startsWith('"') && actualSlug.endsWith('"')) || 
                    (actualSlug.startsWith("'") && actualSlug.endsWith("'"))) {
                    actualSlug = actualSlug.substring(1, actualSlug.length - 1);
                }
            }
        } else if (commandName === "search") {
            searchQueryText = remainingArgsString;
        } else { 
            slugForReadOp = rawArgs; 
            commandName = "read"; 
        }
    }
    
    if (!commandName && !replied) {
        embed_reply("Invalid command format. Please specify a command.", "❌ Error");
        replied = true;
    }

    // Handle each command
    if (!replied) {
        if (commandName === "suggest") {
            if (!actualSlug || !actualBody) {
                embed_reply("Usage: `%t resource suggest <slug> <body_text>`", "❌ Incorrect Usage");
            } else {
                try {
                    const apiData = { slug: actualSlug, body: actualBody };
                    const res = http.request({
                        method: "POST", url: "https://api.excalibursmp.live/suggest",
                        headers: { "Content-Type": "application/json", "X-User-Id": String(msg.author.id) },
                        data: apiData
                    });
                    if (res.status !== 200) { embed_reply(`Suggestion failed (${res.status}).`, "⚠️ API Error"); }
                    else { 
                        if (res.data.error) { embed_reply(res.data.error, "❌ Suggestion Error"); } 
                        else { embed_reply(res.data.msg || "Suggestion queued for review."); }
                    }
                } catch (e) { embed_reply("Suggestion failed (server unreachable).", "⚠️ Network Error"); }
            }
            replied = true;
        } else if (commandName === "edit") {
            if (!actualSlug || !actualBody) {
                embed_reply("Usage: `%t resource edit <slug> <new_body_text>`", "❌ Incorrect Usage");
            } else {
                try {
                    const apiData = { slug: actualSlug, body: actualBody };
                    const res = http.request({
                        method: "POST", url: "https://api.excalibursmp.live/edit",
                        headers: { "Content-Type": "application/json", "X-User-Id": String(msg.author.id) },
                        data: apiData
                    });
                    if (res.data.error) { embed_reply(res.data.error, "❌ Edit Error"); }
                    else { embed_reply(res.data.msg); }
                } catch (e) { embed_reply("Edit failed (server unreachable).", "⚠️ Network Error"); }
            }
            replied = true;
        } else if (commandName === "search") {
            if (!searchQueryText || searchQueryText.trim().length < 2) {
                embed_reply("Search query must be at least 2 characters long.", "❌ Invalid Search");
            } else {
                try {
                    const searchUrl = `https://api.excalibursmp.live/search/resources?q=${encodeURIComponent(searchQueryText.trim())}`;
                    const res = http.request({ method: "GET", url: searchUrl });
                    if (res.status !== 200) {
                        let errorDetail = (res.data && res.data.detail) ? ` Details: ${res.data.detail}` : '';
                        embed_reply(`Search failed (${res.status}).${errorDetail}`, "⚠️ API Error");
                    } else {
                        const searchData = res.data; 
                        if (searchData && searchData.results && searchData.results.length > 0) {
                            let descriptionText = `Found ${searchData.count} result(s) for "${searchData.query}":\n\n`;
                            searchData.results.forEach((item, index) => {
                                let titlePart = `**${item.title}**`; 
                                let snippetPart = "";
                                if (item.snippet) { snippetPart = `: ${item.snippet.replace(/\n/g, ' ')}`; }
                                descriptionText += `${index + 1}. ${titlePart}${snippetPart}\n`;
                            });
                            if (descriptionText.length > 4050) { 
                                descriptionText = descriptionText.substring(0, 4050) + "\n... (results truncated)";
                            }
                            embed_reply(descriptionText, "🔎 Search Results");
                        } else {
                            embed_reply(`No results found for "${searchQueryText.trim()}".`, "❓ No Results");
                        }
                    }
                } catch (e) { embed_reply("Search request failed (server unreachable or unexpected error).", "⚠️ Network Error"); }
            }
            replied = true; 
        } else if (commandName === "read") {
            const slugForRead = slugForReadOp; 
            if (!slugForRead && !replied) { 
                embed_reply("Usage: `%t resource <topic_slug>`", "❌ Incorrect Usage");
            } else {
                try {
                    const res = http.request(
                        `https://api.excalibursmp.live/resource/${encodeURIComponent(slugForRead)}`
                    );
                    const data = res.data; 
                    if (data && data.error) {
                        embed_reply(`Nothing approved for “${slugForRead}”. Try searching or suggesting it.`, "❓ Not Found");
                    } else {
                        const { title, body, attribution, last_reviewed } = data; 
                        let embedText = `${body}\n\n-# Info written by ${attribution ? `<@${attribution}>` : 'Unknown Author'}`;
                        if (last_reviewed) {
                            embedText += ` (reviewed ${last_reviewed.slice(0, 10)})`;
                        }
                        embed_reply(embedText, title);
                    }
                } catch (e) { embed_reply("Resource fetch failed (server unreachable).", "⚠️ Network Error"); }
            }
            replied = true;
        }

        // If no command was matched (somehow), show usage
        if (!replied) { 
            embed_reply("Unknown resource command. Usage:\n"
            + "`%t resource <topic>`\n"
            + "`%t resource suggest <slug> <body_text>`\n"
            + "`%t resource edit <slug> <new_body_text>`\n"
            + "`%t resource search <query>`", "❌ Error");
        }
    }
}