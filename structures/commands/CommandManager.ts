import type { APIApplicationCommand, APIApplicationCommandOption, ApplicationCommandData, ApplicationCommandDataResolvable, CommandInteraction } from "discord.js";
import type { CommandData } from "../../types";
import InternalCommand from "./InternalCommand";

export default new class {

    constructor() {}

    private keyToIndex: Record<string, number> = {};
    private values: InternalCommand[] = [] 

    registerCommand(name: string | string[], description: string, options: APIApplicationCommandOption[], nsfw = false, commandData: CommandData | undefined,  handler: (interaction: CommandInteraction) => void) {
        const newCommandIndex = this.values.length
        const internalCommand = new InternalCommand(name, description, options, nsfw, commandData, handler);

        if(name instanceof Array) {
            for(let index = 0; index < name.length; index++) {
                this.keyToIndex[name[index]] = newCommandIndex;
                this.values[newCommandIndex] = internalCommand
            }
        } else {
            this.keyToIndex[name] = newCommandIndex;
            this.values[newCommandIndex] = internalCommand
        }
    }

    searchCommand(name: string) {
        if(this.keyToIndex[name] == undefined) {
            return undefined;
        }

        return this.values[this.keyToIndex[name]];
    }

    toJSONCommands() {
        const result: ApplicationCommandData[] = [];

        for(let index = 0; index < this.values.length; index++) {
            result.push(...this.values[index].toJSON())
        }

        return result;
    }
}