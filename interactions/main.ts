import type { AnySelectMenuInteraction, Interaction} from "discord.js"

import { ButtonInteraction, Guild, ModalSubmitInteraction } from "discord.js";

import { Debug } from "../structures/logger";


import commandManager from "../structures/commands/CommandManager";
import CommandManager from "../structures/commands/CommandManager";
import InteractionManager, { InternalInteractionType } from "../structures/InteractionManager";

const reloadCommands = async (guild: Guild) => {
	return await guild.commands.set(CommandManager.toJSONCommands()).then(() => {
		return true;
	}).catch((error) => {
		console.log(error);
		return false;
	})
}

function getInteractionType(interaction: Interaction): InternalInteractionType | undefined {
    if (interaction.isChatInputCommand()) return InternalInteractionType.Command;
    if (interaction.isAutocomplete()) return InternalInteractionType.AutoComplete;
    if (interaction.isButton()) return InternalInteractionType.Button;
    if (interaction.isAnySelectMenu()) return InternalInteractionType.SelectMenu;
    if (interaction.isModalSubmit()) return InternalInteractionType.Modal;
    return undefined;
}

const handleInteraction = (interaction: Interaction) => {
	Debug("info", "main.ts", "handleInteraction", "Interaction Incoming\nInteraction Type:" + interaction.type);

	const interactionType = getInteractionType(interaction);
	if(!interactionType) return;

	if(interaction.isCommand()) {
		const command = commandManager.searchCommand(interaction.commandName)
		if(!command) return;

		if(interaction.isChatInputCommand()) {
			command.execute(interaction);
		} else if(interaction.isAutocomplete()) {
			command.autoComplete(interaction);
		} else if(interaction.isContextMenuCommand()) {
			command.context(interaction);
		}

		return;
	}

	InteractionManager.searchHandler((interaction as AnySelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction).customId, interactionType);
}


export { handleInteraction, reloadCommands};