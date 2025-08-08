const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
const tagDump = JSON.parse(fs.readFileSync(path.join(__dirname, config.paths.rawDump), 'utf8'));
const IDs = Object.keys(config.users);

tagDump.forEach(tag => {
    if (IDs.includes(tag.owner)) {
        const username = config.users[tag.owner];
        if (tag.body.startsWith("```js") && !config.blacklist.includes(tag.name) && tag.hops.length === 1) {
            let script = tag.body.replace(/```js/, '');
            const lastIndex = script.lastIndexOf('```');
            if (lastIndex !== -1) {
                script = script.slice(0, lastIndex) + script.slice(lastIndex + 3);
            }
            const pathToFile = path.join(__dirname, config.paths.output, username, `${tag.name}.js`);
            const dir = path.dirname(pathToFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(pathToFile, script);
        }
    }
});

