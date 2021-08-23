const { CommandInteraction, Client } = require('discord.js');
const fivem_status = require('../data/fivem_status.json');
let cooldowns = []

module.exports = {
    name: ["ip", "connect"],
    cooldown: (60 * 1000) * 5, // 5 Minutes
    description: "Shows The Server IP",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        
        if(cooldowns.includes(interaction.user.id)) {
            let embed = client.createEmbed("IP Command", [], `Hi, You have a cooldown on this command\nCooldown time on this command is equal to 2 Minutes`);

            return interaction.reply({embeds: [embed], ephemeral: true});
        }

        let fields = [
            {name: "FiveM", value: `${fivem_status.ips['public-ip']}`, inline: true},
            {name: "TeamSpeak", value: `${fivem_status.ips['ts-ip']}`, inline: true},
            {name: "Status", value: `${(client.playersJson == undefined) ? "Offline" : "Online!"}`, inline: false}
        ]

        let embed = client.createEmbed("IP Command", fields);
        interaction.reply({embeds: [embed]});

        cooldowns.push(interaction.user.id);
        setTimeout(() => {
            cooldowns.splice(cooldowns.indexOf(interaction.user.id), 1);
        }, this.cooldown)

    },
};