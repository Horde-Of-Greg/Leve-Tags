(() => { 
if (tag.args == undefined) return "Invalid amount of arguments!"

const args = tag.args.split(" ")
const bing_url = "https://www.bing.com/search?q="

// stupid discord
function formatString(string) {
  return string.replaceAll(" ", "%20").replaceAll(">", "%3E")
}

  if (args.length < 1) return "Invalid amount of arguments!"
  return `<${bing_url.concat(formatString(tag.args))}>`
})();