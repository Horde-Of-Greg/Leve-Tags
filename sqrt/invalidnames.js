const names = util.dumpTags().filter(name => !/^[A-Za-z0-9\-_]{0,32}$/.test(name)).join("\n")

msg.reply({
    file: {
        name: "invalid.txt",
        data: names
    }
})