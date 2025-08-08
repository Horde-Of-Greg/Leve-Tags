
(() => { 
if (tag.args == undefined) return "Invalid amount of arguments!"

const args = tag.args.split(" ")
const ff_url = "http://frogfind.com/?q="

// stupid discord
function formatString(string) {
  return string.replaceAll(" ", "%20").replaceAll(">", "%3E")
}

  if (args.length < 1) return "Invalid amount of arguments!"
  return `<${ff_url.concat(formatString(tag.args))}>`
})();