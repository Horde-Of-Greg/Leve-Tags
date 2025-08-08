
let response = http.request("https://thesimpsonsquoteapi.glitch.me/quotes").data[0]
msg.reply({
  embed: {
    author: {
      name: response.character,
      icon_url: response.image,
    },
    description: response.quote,
  },
});
