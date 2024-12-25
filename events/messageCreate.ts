import type { Message } from "discord.js";
import { Debug, Log } from "../structures/logger";
import { reloadCommands } from "../interactions/main";


const handler = async (message: Message) => {
    if(message.member == null || message.guild == null) return Debug("info", "events/main.ts", "EVENT (messageCreate)", "Ignored a message from DM (?), Content: " + message.content + "\nUser: " + message.author.username);
    
    if(message.content == "reload_commands" && message.member.permissions.has("Administrator")) {
        Log("info", "Starting to reload commands by the request of " + message.author.username);

        const successful = await reloadCommands(message.guild);

        if(successful) {
            message.reply(":beach:")
        } else {
            message.reply(":fire:")
        }

    }
}

export { handler }