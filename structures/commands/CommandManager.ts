import type { ApplicationCommandData, ApplicationCommandOptionData, AutocompleteInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { CommandData } from "../../types";
import InternalCommand from "./InternalCommand";
import MultipleKeyValue from "../MultipleKeyValue";

export default new class {

    constructor() {}

    private commands = new MultipleKeyValue<InternalCommand>()

    registerCommand(name: string | string[], description: string, options: ApplicationCommandOptionData[] = [], nsfw = false, contextHandler: ((interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction) => void) | undefined,  autoCompleteHandler: ((interaction: AutocompleteInteraction) => void) | undefined ,commandData: CommandData | undefined, handler: (interaction: ChatInputCommandInteraction) => void) {
        const internalCommand = new InternalCommand(name, description, options, nsfw, contextHandler, autoCompleteHandler, commandData, handler);

        this.commands.set((Array.isArray(name) ? name : [name]), internalCommand);
    }

    searchCommand(name: string) {
        return this.commands.searchValue(name);
    }

    toJSONCommands() {
        const result: ApplicationCommandData[] = [];
        const values = this.commands.getValues();

        for(let index = 0; index < values.length; index++) {
            result.push(...values[index].toJSON())
        }

        return result;
    }
}