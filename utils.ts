import { getServerInfoFormatted } from "./structures/serverListener";
import type { BasePlaceholders, ExtraPlaceHolders } from "./types";
import type { APIEmbed, GuildMember } from "discord.js";


const ephemeralFlag = (ephemeral: boolean) => {
    return ephemeral ? "Ephemeral" : undefined
}

function placeholderText(
	member: GuildMember | null,
	content: string,
	extra: null | ExtraPlaceHolders,
  ): string;
  
function placeholderText(
	member: GuildMember | null,
	content: APIEmbed,
	extra: null | ExtraPlaceHolders,
  ): APIEmbed;

function placeholderText(member: GuildMember | null, content: string | APIEmbed, extra: null | ExtraPlaceHolders) {
	const data =  getPlaceholderData(member, extra)

	const isEmbed = !(typeof content == "string")
	const newContent = placeholderString(JSON.stringify(content), data, isEmbed);

	if(isEmbed) {
		return newContent as APIEmbed;
	} else {
		return newContent as string
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


const placeholderString = (str: string, data: BasePlaceholders, isEmbed: boolean) => {
    for(const formatterIndex in data) {
        const value = data[(formatterIndex as keyof BasePlaceholders)] ?? "No Data";
        str = str.replaceAll("%" + formatterIndex + "%", value as string);
    }

    return isEmbed ? JSON.parse(str) as APIEmbed : str;
}

export { 
    ephemeralFlag,
    placeholderText
}