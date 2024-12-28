import type { BasePlaceholders } from "./types";
import type { APIEmbed, EmbedBuilder } from "discord.js";


const formatJsonString = (str: string, data: BasePlaceholders) => {
    for(const formatterIndex in data) {
        const value = data[(formatterIndex as keyof BasePlaceholders)] ?? "No Data";
        str = str.replaceAll("%" + formatterIndex + "%", value as string);
    }

    return JSON.parse(str) as APIEmbed;
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
    formatJsonString,
    formatEmbed,
}