const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]});
const { readdirSync } = require('fs');
const config = require('./config.json');
const fivem_status = require('./data/fivem_status.json');
const fetch = require('node-fetch');
let moment = require('moment')


client.on("ready", async () => {

    client.version = "1.0";
    client.guild = await client.guilds.fetch(config.client.guild);
    client.commands = [];
    client.cached_messages = {};
    client.cached_channels = {};
    moment.defaultFormat = "HH:mm:ss - DD/MM/YY";

    const filter = f => f.endsWith(".js")
    const commandsDir = readdirSync("./commands").filter(filter);
    const customEventsDir = readdirSync("./custom-events").filter(filter);
    // Functions

    client.createEmbed = function(titleaddon, fields = [], data = undefined) {

        let embed = new MessageEmbed()
        .setAuthor(`No Name Server | ${titleaddon}`, `https://i.ibb.co/C05fv3Z/866847114863312906.png`)
        .setColor("BLUE")
        .setFooter(`All rights reserved to No Name`)
        .setThumbnail("https://i.ibb.co/C05fv3Z/866847114863312906.png")
        .setTimestamp();

        if(fields.length !== 0) {
            embed.addFields(fields)
        }

        if(data !== undefined) {
            embed.setDescription(data);
        }
        
        return embed;
    }

    /* [ Commands ] */
    for(const command of commandsDir) {
        let commandReq = require(`./commands/${command}`);
        if(Array.isArray(commandReq.name)) {
            for(let i of commandReq.name)
                client.commands.push({name: i, description: commandReq.description ?? "No description specified", options: commandReq.options ?? [], executor: commandReq})
        } else {
            client.commands.push({name: commandReq.name, description: commandReq.description ?? "No description specified", options: commandReq.options ?? [], executor: commandReq})
        }
    }

    /* [ Channels ] */
    for(let channelrow of config.channels) {
        let channel;
        try {
            channel = client.channels.cache.get(channelrow.id);
        } catch {
            channel = undefined
        }

        if(channel == undefined) {
            console.log(`[WARN]: Channel "${channelrow.name}" Was Not Found`);
            continue;
        }

        
        client.cached_channels[channelrow.name] = channel;
    }

    /* [ Messages ] */
    for(let messageRow of config.messages) {
        if(client.cached_channels[messageRow.channel] !== undefined) {
            let message;
            try {
                message = await client.cached_channels[messageRow.channel].messages.fetch(messageRow.id).catch(err => message = undefined);
                client.cached_messages[messageRow.name] = message;
            } catch {
                message = undefined;
            }

            if(message == undefined) {
                console.log("[ERROR]:", `Unknown Message ${messageRow.name}`)
            }
        }
    }

    /* [ Requests ] */
    setInterval(async () => {
        try {
            client.playersJson = await fetch(`http://${fivem_status.ips['private-ip']}/players.json`).then(_ => _.json());
            client.infoJson = await fetch(`http://${fivem_status.ips['private-ip']}/info.json`).then(_ => _.json());
        } catch(err) {
            client.playersJson = undefined;
            client.infoJson = undefined;
        }
    }, 10000);

    /* [ Custom Events ] */
    if(client.guild != undefined) {
        await client.guild?.commands.set(client.commands);
        for(let customEvent of customEventsDir) {
            require(`./custom-events/${customEvent}`).execute(client);
        }
    }
    
    /* [ Ready ] */
    console.log(`I'm Ready!, Logged In As ${client.user.tag}.`);
});

client.on("interactionCreate", (interaction) => {
    if(interaction.isButton()) return;

    let commandExecutor;

    for(let command of client.commands) {
        if(command.name == interaction.commandName) {
            commandExecutor = command.executor;
        }
    }

    if(commandExecutor == undefined) {
        return interaction.reply({content: "Can't find this command :(", ephemeral: true})
    }

    commandExecutor.execute(interaction, client);

});

client.login(config.client.token);
