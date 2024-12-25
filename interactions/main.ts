import { DiscordAPIError, Guild, InteractionType, type Client, type CommandInteraction, type Interaction } from "discord.js";
import { Debug, Log } from "../structures/logger";
import commands from "./commands";

const reloadCommands = async (guild: Guild) => {
    const commandFormat = []

    for(const [ commandName, commandData] of commands) {
        if(commandName instanceof Array) {
            for(let index = 0; index < commandName.length; index++) {
                commandFormat.push({
                    name: commandName[index],
                    description: commandData.description,
                    default_member_permission: commandData.default_member_permissions,
                    options: commandData.options
                })
            }

            continue;
        } 

        commandFormat.push({
            name: commandName,
            description: commandData.description,
            default_member_permission: commandData.default_member_permissions,
            options: commandData.options
        })
    }

    return await guild.commands.set(commandFormat).then(() => {
        Log("info", "Reloaded commands succesfully");
        return true;
    }).catch((error: DiscordAPIError) => {
        Log("error", "Reloading commands failed.");
        Debug("error", "interactions/main.ts", "reloadCommands", "Error while reloading commands:\n" + error.message);
        return false;
    });
}

const getCommmandHandler = (desiredCommand: string) => {
    const mapCommand = commands.get(desiredCommand);

    if(mapCommand != undefined) {
        return mapCommand.onInteract;
    }
    
    for(const [commandName, commandData] of commands) {
        if(commandName instanceof Array && commandName.includes(desiredCommand)) {
            return commandData.onInteract
        }
    }

    return undefined;
}

const handleCommand = (interaction: CommandInteraction) => {
    Debug("info", "main.ts", "handleInteraction - ChatInput", "Command came through\nCommand Name" + interaction.commandName + "\nUser:" + interaction.user.username);
        
    const commandHandler = getCommmandHandler(interaction.commandName);
    
    if(commandHandler) {
        commandHandler(interaction);
    } else {
        Log("warning", "Not existing command was tried, Please reload commands.");
    }
}

const handleInteraction = (interaction: Interaction) => {
    Debug("info", "main.ts", "handleInteraction", "Interaction Incoming\nInteraction Type:" + interaction.type);
    
    switch(interaction.type) {
        case InteractionType.ApplicationCommand:
            handleCommand(interaction);
            break;
        default:
            Log("warning", "Not supported interaction came in, Skipping.")
            Debug("warn", "interactions/main", "handleInteraction", "Not supported interaction came in, Skipping it\nType: " + interaction.type);
            break;
    }
}

export { handleInteraction, reloadCommands };