let jex = tag.args ?? "abcdefghijklmnopqrstuvwxyz";
jex.split("")
    .map(x => x + "ex")
    .join(" ");
