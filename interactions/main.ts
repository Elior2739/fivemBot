import { Base, ButtonInteraction, ChatInputCommandInteraction, DiscordAPIError, Guild, GuildMember, GuildMemberManager, InteractionType, ModalSubmitInteraction, PermissionFlagsBits, PermissionsBitField, type APIEmbed, type ChatInputApplicationCommandData, type Client, type CommandInteraction, type GuildTextBasedChannel, type Interaction, type InteractionEditReplyOptions, type InteractionReplyOptions, type PermissionResolvable } from "discord.js";
import { Debug, Log } from "../structures/logger";
import commands from "./commands";
import type { BasePlaceholders, Command } from "../types";
import modals from "./modals";
import { placeholderString } from "../utils";
import { getServerInfoFormatted } from "../structures/serverListener";
import buttons from "./buttons";

const reloadCommands = async (guild: Guild) => {
	const commandFormat = []

	for (const [commandName, commandData] of commands) {
		if (commandName instanceof Array) {
			for (let index = 0; index < commandName.length; index++) {
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

	if (mapCommand != undefined) {
		return mapCommand;
	}

	for (const [commandName, commandData] of commands) {
		if (commandName instanceof Array && commandName.includes(desiredCommand)) {
			return commandData
		}
	}

	return undefined;
}

const allowedCommand = (commandName: string, commandInteraction: CommandInteraction, command: Command, member: GuildMember): boolean => {
	if (command.commandData == undefined || command.commandData.permission == undefined) return true;
	const commandPermission = command.commandData.permission;

	if (commandPermission.type !== "permission" && commandPermission.type !== "role") {
		Log("warning", "Command: " + commandName + "Execution got into an error, Command settings request permission but the permission type isn't valid, Expected: role/permission, Got: " + commandPermission.type)
		Debug("warn", "main.ts", "allowedCommand", "Command: " + commandName + "Execution got into an error, Command settings request permission but the permission type isn't valid, Expected: role/permission, Got: " + commandPermission.type);
		return false;
	}

	if (commandPermission.type == "permission") {
		const permission = PermissionsBitField.resolve(commandPermission.value as PermissionResolvable)

		if (!commandInteraction.command?.defaultMemberPermissions?.equals(permission)) {
			Log("error", `Please notice!, Command: ${commandName} permission isn't updated. Please reload commands`)
		}


		if (!Object.values(PermissionsBitField.Flags).includes(permission)) {
			return false;
		}

		return member.permissions.has(permission, !commandPermission.ignoreAdministrator);
	}

	const hasRequiredRole = member.roles.cache.has(commandPermission.value);

	if (!hasRequiredRole && member.permissions.has("Administrator") && commandPermission.ignoreAdministrator == false) {
		return true;
	}

	return hasRequiredRole;
}

const handleCommand = (interaction: CommandInteraction) => {
	Debug("info", "main.ts", "handleInteraction - ChatInput", "Command came through\nCommand Name" + interaction.commandName + "\nUser:" + interaction.user.username);
	if (interaction.member == null || !(interaction.member instanceof GuildMember)) {
		interaction.reply({ content: "You can't use commands in DM's" })
		return;
	}

	const commandHandler = getCommmandHandler(interaction.commandName);

	if (commandHandler) {

		if (!allowedCommand(interaction.commandName, interaction, commandHandler, interaction.member)) {
			interaction.reply({ content: "You aren't allowed to use this command", ephemeral: true });
			return;
		}

		commandHandler.onInteract(interaction);
	} else {
		Log("warning", "Not existing command was tried, Please reload commands.");
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
	extra: null | BasePlaceholders,
	callback: (newContent: string) => void
  ): void;
  
function placeholderText(
	member: GuildMember | null,
	content: APIEmbed,
	extra: null | BasePlaceholders,
	callback: (newContent: APIEmbed) => void
  ): void;

function placeholderText(member: GuildMember | null, content: string | APIEmbed, extra: null | BasePlaceholders, callback: (newContent: any) => void) {
	const data =  getPlaceholderData(member, extra)

	const isEmbed = !(typeof content == "string")
	const newContent = placeholderString(JSON.stringify(content), data, isEmbed);

	if(isEmbed) {
		callback(newContent as APIEmbed);
	} else {
		callback(newContent as string)
	}
		
}

const getPlaceholderData = (member: GuildMember | null, extra: null | BasePlaceholders) => {
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