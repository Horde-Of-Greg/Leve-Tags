function execute_tag(name) {
    //Executes the given tag, and return the results.
    //Input: String
    //Output: String

    const tag = util.fetchTag(name);
    if (typeof tag === "undefined" || tag.body === ".") {
        return;
    }
    if (!(tag.body.startsWith("```js") && tag.body.endsWith("```"))) {
        return tag.body;
    }
    const res = Function("code", "return eval(code)").call(
        this,
        tag.body.slice(5, -3)
    );
    if (res === ".") {
        return;
    }
    return res;
}

function get_all_contraptions() {
    //Fetch the list of contraptions.
    //output: Array[String] a list of contraptions

    const is_contraption = /^contraption\d+$/;
    // A contraption must:
    // - start with `contraption`
    // - proceeds with a number and nothing more

    return util
        .dumpTags()
        .filter((line) => is_contraption.test(line))
        .sort(
            (a, b) =>
                a.replace("contraption", "") - b.replace("contraption", "")
        );
}
function get_random_element(array) {
    //Given a array of items, return a random one.
    //input: Array[Any]
    //output: Any

    return array[(Math.random() * array.length) | 0];
}

function get_latest_contraption(contraptions) {
    //Given a list of contraptions, returns the latest one.
    //input: Array[String]
    //output: Int (latest number)

    const contraption_numbers = contraptions.map((contraption) =>
        parseInt(contraption.replace("contraption", ""), 10)
    );

    //Because there are people who put the contraption numbers wrong, we will have to conpensate that
    //by finding that first non consecutive contraption number.
    //for example: 1,2,3,5,6, will return 3 instead of 6.

    for (let index = 1; index < contraption_numbers.length; index++) {
        if (contraption_numbers[index] !== contraption_numbers[index - 1] + 1) {
            // We actually overshot and gotten 5 instead of 3, we can adjust this by subtrating the index by 1
            return contraption_numbers[index - 1];
        }
    }

    return contraption_numbers[contraption_numbers.length - 1];
    // All contaptions are in order and there is no gaps, then we just return the last one.
}

function retrieve_contraption(tag_name) {
    try {
        return execute_tag(`contraption${contraption_number}`);
    } catch (err) {
        return null;
    }
}
function get_option(input) {
    // Input: Array[String] A list of args seperated by spaces
    const command = input[0];
    const contraptions = get_all_contraptions();
    switch (command) {
        case "r":
        case "rand":
        case "random":
            // We handle the case `random <number>` to show <number> amount of contraptions
            const contraption_amount = input.at(1) ?? null;
            if (!contraption_amount) {
                return execute_tag(get_random_element(contraptions));
            }
            let random_contraptions = [];
            for (let i = 0; i < contraption_amount; i++) {
                random_contraptions.push(
                    execute_tag(get_random_element(contraptions))
                );
            }
            return random_contraptions.join("\n");
        case "list":
            msg.reply({
                file: {
                    name: "contraptions.txt",
                    data: "contraptions:\n" + contraptions.join("\n"),
                },
            });
            return;
        case "count":
            return `:information_source: There are **${contraptions.length}** contraptions.`;
        case "next":
            const next = get_latest_contraption(contraptions) + 1;
            return `:information_source: Next contraption: **${next}**`;
        case "latest":
            const latest = get_latest_contraption(contraptions);
            let out = `:information_source: Latest contraption: **${latest}**\n\n`;
            out += execute_tag(`contraption${latest}`);
            return out;
    }
}

((_) => {
    if (!tag.args) {
        return "https://cdn.discordapp.com/attachments/1165208683559522434/1168510251859980298/1698664944839.png";
        // The true Contraption #1
    }

    const input = tag.args;

    // Handle %t contraption <number>
    const contraption_number = parseInt(input, 10);
    if (contraption_number) {
        const output = retrieve_contraption(contraption_number);
        return output
            ? output
            : `Contraption **${contraption_number}** not found!`;
    }

    const output = get_option(input.split(" "));

    if (output) {
        msg.reply(output);
        return;
    }

    const tag_name = msg.content.split(" ")[1];
    //we fetch the tag name incase this isn't called by %t contraption
    return `\`:warning: Invalid arguments.\n Usage: %t ${tag_name} [<number>/random <number>/list/count/next/latest]\``;
})();
