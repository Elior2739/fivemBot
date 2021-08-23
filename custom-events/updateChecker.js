const fetch = require('node-fetch');

module.exports = {
    async execute(client) {

        let newVersion = await fetch(`https://api.github.com/repos/Elior2739/fivemBot/releases/latest`).then(data => data.json())

        if(newVersion.html_url == undefined) {
            return console.log("[ERROR]:", "Can't find the latest version of the bot...")
        }

        if(client.version != newVersion.tag_name) {
            console.log("[UPDATE]:", `A new update is avaliable, Download link: ${newVersion.html_url}`);
        } else {
            console.log("[UPDATE]:", `You have the latest version (${client.version})`);
        }

    },
};