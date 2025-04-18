import { GuildMember, PermissionsBitField, type APIApplicationCommandBasicOption, type APIApplicationCommandOption, type ApplicationCommandData, type ApplicationCommandOptionData, type BaseApplicationCommandOptionsData, type CommandInteraction, type PermissionResolvable } from "discord.js";
import type { CommandData } from "../../types";
import mainMessages from "../../config/messages.json";

class InternalCommand {

    private name: string | string[];
    private description: string;
    private commandData: CommandData | undefined;
    private readonly options: ApplicationCommandOptionData[] | undefined;
    private nsfw: boolean;

    private cooldowns: Record<string, number> = {};

    private handler;

    constructor(name: string | string[], description: string, options: ApplicationCommandOptionData[] = [], nsfw = false, commandData: CommandData | undefined, handler: (interaction: CommandInteraction) => void) {
        this.name = name;
        this.description = description;
        this.commandData = commandData;
        this.options = options;
        this.nsfw = nsfw;

        this.handler = handler
    }

    private isUnderLimit(userId: string) {
        if(!this.commandData?.cooldown.enabled) {
            return false;
        }


        if(this.cooldowns[userId] && (Date.now() - this.cooldowns[userId]) < 0) {
            return true;
        }

        this.cooldowns[userId] = Date.now() + (this.commandData.cooldown.time * 1000);
        return false;
    }

    private isAllowed(member: GuildMember) {
        if(this.commandData == undefined) return true;

        const permissionType = this.commandData.permission.type;
        const permissionValue = this.commandData.permission.value;
        const administratorBypass = this.commandData.permission.administratorBypass;

        if(permissionType != "role" && permissionType != "permission") return true;

        return (permissionType == "role" ? member.roles.cache.has(permissionValue) : member.permissions.has(PermissionsBitField.resolve(permissionValue as PermissionResolvable))) || administratorBypass;
    }

    public execute(interaction: CommandInteraction) {
        if(!(interaction.member instanceof GuildMember)) {
            interaction.reply({content: mainMessages["general_error"], flags: "Ephemeral"})
            return;
        } else if(this.isUnderLimit(interaction.user.id)) {
            interaction.reply({content: mainMessages["cooldown"], flags: "Ephemeral"});
            return;
        } else if(!this.isAllowed(interaction.member)) {
            interaction.reply({content: mainMessages["no_permission"], flags: "Ephemeral"})
            return;
        }

        this.handler(interaction);
    }

    private JSONObject(name: string): ApplicationCommandData {
        return {
            name,
            description: this.description,
            options: this.options,
            nsfw: this.nsfw,
            defaultMemberPermissions: this.commandData?.permission.type == "permission" ? PermissionsBitField.resolve(this.commandData?.permission.value as PermissionResolvable) : undefined
        }
    }

    public toJSON(): ApplicationCommandData[] {
        if(this.name instanceof Array) {
            const result: ApplicationCommandData[] = [];

            for(let index = 0; index < this.name.length; index++) {
                result.push(this.JSONObject(this.name[index]));
            }

            return result;
        }

        return [this.JSONObject(this.name)];
    }
}

export default InternalCommand;