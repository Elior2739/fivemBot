import type { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import type { CommandData } from "../types";

enum InternalInteractionType {
    Command = 1,
    AutoComplete = 2,
    Button = 3,
    SelectMenu = 4,
    Modal = 5
}

type InteractionMap = {
    [InternalInteractionType.Command]: ChatInputCommandInteraction;
    [InternalInteractionType.AutoComplete]: AutocompleteInteraction;
    [InternalInteractionType.Button]: ButtonInteraction;
    [InternalInteractionType.SelectMenu]: AnySelectMenuInteraction;
    [InternalInteractionType.Modal]: ModalSubmitInteraction;
};

type InteractionHandler<T extends InternalInteractionType = InternalInteractionType> = {
    cooldown: string[],
    featureData: CommandData | undefined,
    type: T;
    handler: (interaction: any) => void;
};

export default new class {

    private interactions: Record<string, InteractionHandler> = {};

    public searchHandler<T extends InternalInteractionType = InternalInteractionType>(id: string, type: T) {
        const interactionData = this.interactions[id];

        if(interactionData == undefined) {
            return;
        }

        if(type != interactionData.type) {
            console.log("Invalid type to interaction, Type got: " + type + " Exp: " + interactionData.type);
            // TODO: Log, Debug, Bye.
            return;
        }

       return interactionData.handler as (interaction: InteractionMap[T]) => void;
    }

    public registerHandler<T extends InternalInteractionType = InternalInteractionType>(id: string, featureData: CommandData | undefined, type: T, handler: (interaction: InteractionMap[T]) => void) {
        if(this.interactions[id] != undefined) {
            console.log("New interaction register was tried, ID: " + id + ". Type: " + InternalInteractionType[type] + ", Already registered one: " + InternalInteractionType[this.interactions[id].type]);
            return;
        }

        this.interactions[id] = {
            cooldown: [],
            featureData,
            type,
            handler
        }
    }

}

export {
    InternalInteractionType
}