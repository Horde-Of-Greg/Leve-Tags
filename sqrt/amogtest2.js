let i = tag.args.lastIndexOf("https");
if(!i) {
    i = tag.args.indexOf("https");
}

let url = tag.args.slice(i);
tag.args = tag.args.slice(0, i - 1);

Function("tag", "msg", "http", http.request(url).data)(tag, msg, http);