import { DiscordAPIError, Guild, GuildMember, InteractionType, PermissionFlagsBits, type Client, type CommandInteraction, type Interaction, type PermissionResolvable } from "discord.js";
import { Debug, Log } from "../structures/logger";
import commands from "./commands";
import type { Command } from "../types";

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
        return mapCommand;
    }
    
    for(const [commandName, commandData] of commands) {
        if(commandName instanceof Array && commandName.includes(desiredCommand)) {
            return commandData
        }
    }

    return undefined;
}

const allowedCommand = (commandName: string, commandInteraction: CommandInteraction, command: Command, member: GuildMember): boolean => {
    if(command.commandData == undefined || command.commandData.permission == undefined) return true;
    const commandPermission = command.commandData.permission;

    if(commandPermission.type !== "permission" && commandPermission.type !== "role") {
        Log("warning", "Command: " + commandName + "Execution got into an error, Command settings request permission but the permission type isn't valid, Expected: role/permission, Got: " + commandPermission.type)
        Debug("warn", "main.ts", "allowedCommand", "Command: " + commandName + "Execution got into an error, Command settings request permission but the permission type isn't valid, Expected: role/permission, Got: " + commandPermission.type);
        return false;
    }

    if(commandPermission.type == "permission" && commandInteraction.command?.defaultMemberPermissions?.equals(commandPermission.value)) {
        Log("")
        return false;
    }

}

const handleCommand = (interaction: CommandInteraction) => {
    Debug("info", "main.ts", "handleInteraction - ChatInput", "Command came through\nCommand Name" + interaction.commandName + "\nUser:" + interaction.user.username);
    if(interaction.member == null || !(interaction.member instanceof GuildMember)) {
        interaction.reply({content: "You can't use commands in DM's"})
        return;
    }

    const commandHandler = getCommmandHandler(interaction.commandName);
    
    if(commandHandler) {

        if(!allowedCommand(interaction.commandName, interaction, commandHandler, interaction.member)) {
            interaction.reply({content: "You aren't allowed to use this command", ephemeral: true});
            return;
        }

        commandHandler.onInteract(interaction);
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