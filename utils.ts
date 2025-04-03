import type { BasePlaceholders } from "./types";
import type { APIEmbed, EmbedBuilder } from "discord.js";


const placeholderString = (str: string, data: BasePlaceholders, isEmbed: boolean) => {
    for(const formatterIndex in data) {
        const value = data[(formatterIndex as keyof BasePlaceholders)] ?? "No Data";
        str = str.replaceAll("%" + formatterIndex + "%", value as string);
    }

    
    return isEmbed ? JSON.parse(str) as APIEmbed : str;
}


const formatEmbed = (embed: EmbedBuilder, newEmbedData: APIEmbed) => {
    if(newEmbedData.author != undefined) {
        embed.setAuthor(newEmbedData.author);
    }

    if(newEmbedData.color != undefined) {
        embed.setColor(newEmbedData.color);
    }

    if(newEmbedData.description != undefined) {
        embed.setDescription(newEmbedData.description);
    }

    if(newEmbedData.footer != undefined) {
        embed.setFooter(newEmbedData.footer);
    }

    if(newEmbedData.image != undefined) {
        embed.setImage(newEmbedData.image.url);
    }

    if(newEmbedData.thumbnail != undefined) {
        embed.setThumbnail(newEmbedData.thumbnail.url);
    }

    if(newEmbedData.title != undefined) {
        embed.setTitle(newEmbedData.title);
    }

    return embed;
}

export { 
    placeholderString,
    formatEmbed,
}