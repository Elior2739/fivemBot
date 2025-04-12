import type { APIEmbed, CommandInteraction, Interaction, PermissionResolvable} from "discord.js"
import type { BasePlaceholders, Command, ExtraPlaceHolders, SuggestionPlaceholders } from "../types";

import { ButtonInteraction, Guild, GuildMember, InteractionType, ModalSubmitInteraction, PermissionsBitField } from "discord.js";

import { Debug, Log } from "../structures/logger";
import { getServerInfoFormatted } from "../structures/serverListener";

import modals from "./modals";
import buttons from "./buttons";

import { placeholderString } from "../utils";

import commandManager from "../structures/commands/CommandManager";
import CommandManager from "../structures/commands/CommandManager";

const reloadCommands = async (guild: Guild) => {
	return await guild.commands.set(CommandManager.toJSONCommands()).then(() => {
		return true;
	}).catch((error) => {
		return false;
	})
}

const handleCommand = (interaction: CommandInteraction) => {
	const command = commandManager.searchCommand(interaction.commandName)

	if(command) {
		command.execute(interaction);
	}
}

const handleModal = (interaction: ModalSubmitInteraction) => {
	const modal = modals.get(interaction.customId);

	if (!modal) {
		// TODO: Debug, Log.
		return;
	}

	modal(interaction);
}

const handleButton = (interaction: ButtonInteraction) => {
	const buttonHandle = buttons.get(interaction.customId);

	if (!buttonHandle) {
		// TODO: Debug, Log.
		return;
	}

	buttonHandle(interaction);
}

const handleInteraction = (interaction: Interaction) => {
	Debug("info", "main.ts", "handleInteraction", "Interaction Incoming\nInteraction Type:" + interaction.type);

	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
			handleCommand(interaction);
			break;
		case InteractionType.ModalSubmit:
			handleModal(interaction);
			break;
		case InteractionType.MessageComponent:
			if(interaction.isButton()) {
				handleButton(interaction)
			}
			break;
		default:
			Log("warning", "Not supported interaction came in, Skipping.")
			Debug("warn", "interactions/main", "handleInteraction", "Not supported interaction came in, Skipping it\nType: " + interaction.type);
			break;
	}
}

function placeholderText(
	member: GuildMember | null,
	content: string,
	extra: null | ExtraPlaceHolders,
	callback: (newContent: string) => void
  ): void;
  
function placeholderText(
	member: GuildMember | null,
	content: APIEmbed,
	extra: null | ExtraPlaceHolders,
	callback: (newContent: APIEmbed) => void
  ): void;

function placeholderText(member: GuildMember | null, content: string | APIEmbed, extra: null | ExtraPlaceHolders, callback: (newContent: any) => void) {
	const data =  getPlaceholderData(member, extra)

	const isEmbed = !(typeof content == "string")
	const newContent = placeholderString(JSON.stringify(content), data, isEmbed);

	if(isEmbed) {
		callback(newContent as APIEmbed);
	} else {
		callback(newContent as string)
	}
		
}

const getPlaceholderData = (member: GuildMember | null, extra: null | ExtraPlaceHolders) => {
	return {
		...extra,
		...getServerInfoFormatted(),
		...(member != null ? {
			userTag: "<@" + member.user.id + ">",
			userId: member.user.id,
			userName: member.user.username,
			memberName: member.displayName
		} : {})
	}
}

export { handleInteraction, reloadCommands, placeholderText, getPlaceholderData};