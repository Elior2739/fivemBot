import { Client, Partials } from "discord.js"

const client = new Client({
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "MessageContent"
    ],

    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message
    ]
});

client.login(process.env.TOKEN);

export default client;