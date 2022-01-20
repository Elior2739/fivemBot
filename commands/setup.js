const { CommandInteraction, Client, Permissions } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');

module.exports = {
    name: "setup",
    description: "Setup bot's things",
    options: [
        {
            name: "thing",
            description: "What you want to setup",
            type: 3,
            required: true,
            choices: [
                {
                    name: "fivem-status",
                    value: "fivem-status"
                }
            ]
        },
        {
            name: "channel",
            description: "The channel",
            type: 7,
            required: false,
        }
    ],
    /**
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {

        if (!interaction.member.permissions.has(Permissions.ALL)) {
            let embed = client.createEmbed("Setup Command", [], `Hi, You don't have permission to use this command
            The required permission is: \`ADMINISTRATOR\``);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let thing = interaction.options.getString("thing", true);
        let channel = interaction.options.getChannel("channel", false) ?? interaction.channel;

        if(!channel.isText())
            return interaction.reply({content: "You tagged a channel that isn't text", ephemeral: true});

        if (thing == "fivem-status") {

            await interaction.reply({ content: "Trying to send message...", ephemeral: true })

            let embed = client.createEmbed("FiveM Status", undefined, `**Space Taken:** ?%\n**Players:** 0/0`);
            let setupMessage = await channel.send({ embeds: [embed] }).catch(err => err);
            let config = JSON.parse(readFileSync("./config.json"));

            let foundChannel = false;
            for (let channelRow of config.channels)
                if (channelRow.name == "fivemStatus") {
                    channelRow.id = channel.id;
                    foundChannel = true;
                }

            if(!foundChannel)
                config.channels.push({name: "fivemStatus", id: channel.id})
            
            client.cached_channels["fivemStatus"] = channel;


            let foundMessage = false;
            for (let message of config.messages)
                if (message.name == "fivemStatus") {
                    message.id = setupMessage.id;
                    foundMessage = true;
                }

            if(!foundMessage)
                config.messages.push({name: "fivemStatus", id: setupMessage.id, channel: "fivemStatus"})
            
            client.cached_messages["fivemStatus"] = setupMessage;


            writeFileSync("./config.json", JSON.stringify(config, null, 4))
            interaction.editReply({ content: "Sent Message Succesfuly!" });

        }
    },
};
