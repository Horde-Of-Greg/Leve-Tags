
(() => { 
if (tag.args == undefined) return "Invalid amount of arguments!"

const args = tag.args.split(" ")
const yd_url = "https://yandex.com/search/?text="

// stupid discord
function formatString(string) {
  return string.replaceAll(" ", "%20").replaceAll(">", "%3E")
}

  if (args.length < 1) return "Invalid amount of arguments!"
  return `<${yd_url.concat(formatString(tag.args))}>`
})();
