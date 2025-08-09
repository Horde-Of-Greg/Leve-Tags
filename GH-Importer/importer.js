const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
const tagDump = JSON.parse(fs.readFileSync(path.join(__dirname, config.paths.rawDump), 'utf8'));
const IDs = Object.keys(config.users);

function removeFormattingBackticks(body) {
    let output = body.replace(/```js/, '');
    const lastIndex = output.lastIndexOf('```');
    if (lastIndex !== -1) {
        output = output.slice(0, lastIndex) + output.slice(lastIndex + 3);
    }
    return output;
}

function createDirs(absolutePath) {
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
    }
}

function writeToFile(filePath, content) {
    createDirs(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
}

tagDump.forEach(tag => {
    if (IDs.includes(tag.owner)) {
        const username = config.users[tag.owner];
        if (config.blacklist.includes(tag.name) && tag.hops.length !== 1) {
            return;
        }
        if (tag.body.startsWith("```js")) {

            let script = removeFormattingBackticks(tag.body);

            const pathToFile = path.join(__dirname, config.paths.output, username, `${tag.name}.js`);
            writeToFile(pathToFile, script);
        } else {
            if (tag.name.length > 32) {
                return;
            }
            const pathToFile = path.join(__dirname, config.paths.output, username, `${tag.name}.txt`);
            writeToFile(pathToFile, tag.body);
        }
    }
});

