const { Client, MessageEmbed } = require('discord.js');
const fivem_status = require('../data/fivem_status.json');
const moment = require('moment');

module.exports = {
    /**
     * @param {Client} client 
     */
    async execute(client) {

        let embed = client.createEmbed()
        .setFooter(`All Rights Reserved To No Name Server | Last Updated: ${moment().format()}`)
        embed.timestamp = undefined

        if(client.playersJson != undefined) {

            embed.setAuthor(`No Name Server FiveM Status | The Server Is Online - ${client.playersJson.length}/${client.infoJson.vars.sv_maxClients}`)
            embed.setDescription(`**Space Taken:** ${percentage(client.playersJson.length, client.infoJson.vars.sv_maxClients)}%\n**Players:**: ${client.playersJson.length}/${client.infoJson.vars.sv_maxClients}`)
            
            if(client.playersJson.length == 0) {
                embed.addFields(
                    {name: "ID", value: "...", inline: true},
                    {name: "Name", value: "...", inline: true},
                    {name: "Discord", value: "...", inline: true}
                )
            } else if(client.playersJson.length > +(client.infoJson.vars.sv_maxClients / 2)) {
                let pages = {};
                let currentPlayer = 1;
                let pageNumber = 1;
    
                for(let player of client.playersJson) {
                    if(pages[pageNumber] == undefined)
                        pages[pageNumber] = {id: "", name: "", discord: ""};
    
                    pages[pageNumber].id += `${player.id}\n`;
                    pages[pageNumber].name += `${player.name}\n`;
                    pages[pageNumber].discord += `${getDiscord(player.identifiers)}\n`;
                    
                    currentPlayer++;
                    if(currentPlayer == fivem_status['status-message']['players-per-page']) {
                        pageNumber++;
                        currentPlayer = 1;
                        
                    }
                }

                for(let page in pages) {
                    embed.addFields(
                        {name: "ID", value: pages[page].id, inline: true},
                        {name: "Name", value: removeCharacters(pages[page].name), inline: true},
                        {name: "Discord", value: pages[page].discord, inline: true}
                    )
                }

            } else {
                let result = {id: "", name: "", discord: ""};
                
                for(let player of client.playersJson) {
                    result.id += `${player.id}\n`;
                    result.name += `${player.name}\n`;
                    result.discord += `${getDiscord(player.identifiers)}\n`
                }

                embed.addFields(
                    {name: "ID", value: result.id, inline: true},
                    {name: "Name", value: removeCharacters(result.name), inline: true},
                    {name: "Discord", value: result.discord, inline: true}
                )

            }


        } else {
            embed.setDescription(`**Space Taken:** 0%\n**Players:**: ?/?`)
            embed.setAuthor(`No Name Server FiveM Status | The Server Is Offline`)

            embed.addFields(
                {name: "ID", value: "...", inline: true},
                {name: "Name", value: "...", inline: true},
                {name: "Discord", value: "...", inline: true}
            )

        }

        if(client.cached_messages["fivemStatus"] != undefined)
            client.cached_messages["fivemStatus"].edit({embeds: [embed]}).catch(err => err);

        

        setTimeout(() => {
            this.execute(client);
        }, 10500);

    }
}
/**
 * @param {string[]} identifiers 
 */
function getDiscord(identifiers) {
    for(let identifier of identifiers)
        if(identifier.startsWith("discord:"))
            return `<@${identifier.replace("discord:", "")}>`
    return "Unknown";
}

/**
 * @param {string} str 
 */
function removeCharacters(str) {
    let result = str;
    let SpecialCharacters = ["*", "_", "`", "'", '"']

    for(let charcater of SpecialCharacters) {
        result = result.replace(charcater, "");
    }

    return result;
}

/**
 * @param {number} players 
 * @param {number} maxPlayers 
 * @returns {number}
 */
function percentage(players, maxPlayers) {
    return ((100 * players) / maxPlayers).toFixed(0);
 } 