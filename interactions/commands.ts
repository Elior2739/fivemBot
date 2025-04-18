import { ChannelType, GuildMember, GuildOnboarding } from "discord.js";
import { getServerInfoFormatted } from "../structures/serverListener";
import statusData from "../config/features/status.json"
import suggestionData from "../config/features/suggestion.json"
import adminSuggestionData from "../config/features/suggestionAdmin.json"
import { ephemeralFlag, } from "../utils";
import { placeholderText } from "./main";
import CommandManager from "../structures/commands/CommandManager";
import mainMessages from "../config/messages.json"
import SuggestionManager, { AdminResult } from "../structures/features/Suggestions/SuggestionManager";
import channelMap from "../structures/channelManager";
import client from "../structures/client";
import database from "../structures/database";


const RegisterCommands = () => {

    CommandManager.registerCommand(["status", "ip"], "View the server's status and ip", [], false, statusData, async (interaction) => {
        if(!(interaction.member instanceof GuildMember)) {
            interaction.reply({content: mainMessages["general_error"], flags: "Ephemeral"});
            return;
        }

        await interaction.deferReply({flags: ephemeralFlag(statusData.responesEphemeral)});

        const serverInfo = getServerInfoFormatted();
        const embedStyle = serverInfo.serverOnline ? statusData.embedStates.online : statusData.embedStates.offline;
        
        placeholderText(interaction.member, embedStyle, null, (newContent) => {
            interaction.editReply({embeds: [newContent]})
        })
    });

    CommandManager.registerCommand("suggest", "Suggest a suggestion", [], false, suggestionData, (interaction) => {
        interaction.showModal({
            "custom_id": "suggestion",
            "title": suggestionData.modal.modalTitle,
            "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 4,
                            "custom_id": "suggestion_text",
                            "label": suggestionData.modal.modalInputLabel,
                            "style": 2,
                            "max_length": 256
                        }
                    ]
                }
            ]
        });
    })

    CommandManager.registerCommand("view_suggestion", "A command to view suggestion's votes", [
        {
            name: "id",
            description: "Suggestion ID",
            type: 4,
            required: true
        }
    ], false, adminSuggestionData, async (interaction) => {
        if(!(interaction.member instanceof GuildMember)) {
            interaction.reply({content: mainMessages.general_error, flags: ephemeralFlag(adminSuggestionData.responesEphemeral)});
            return;
        }
        
        const suggestionId = interaction.options.get("id", true).value as number
        const suggestion = SuggestionManager.searchSuggestion(suggestionId);

        await interaction.deferReply({flags: ephemeralFlag(adminSuggestionData.responesEphemeral)});

        if(!suggestion) {
            interaction.editReply({content: suggestionData.messages.notfound});
            return;
        }

        const suggesters = suggestion.getSuggesters();
        let upvotes = "";
        let downvotes = "";

        for(let index = 0; index < suggesters.upvote.length; index++) {
            upvotes += "<@" + suggesters.upvote[index] + ">\\n"
        }

        for(let index = 0; index < suggesters.downvote.length; index++) {
            downvotes += "<@" + suggesters.downvote[index] + ">\\n"
        }

        placeholderText(interaction.member, adminSuggestionData.embedStates.viewvotes, {
            suggestionId: suggestion.getId(),
            suggestionText: suggestion.getText(),
            upvotes: suggesters.upvote.length,
            downvotes: suggesters.downvote.length,
            upvotesText: upvotes,
            downvotesText: downvotes
        }, (newEmbed) => {
            interaction.editReply({embeds: [newEmbed]})
        })
    });

    CommandManager.registerCommand("answer-suggestion", "Answer to a suggestion", [
        {
            name: "id",
            description: "Suggestion ID",
            type: 4,
            required: true
        },
        {
            name: "answer",
            description: "The answer for the suggestion",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Approved",
                    value: "approved"
                },
                {
                    name: "Denied",
                    value: "denied"
                }
            ]
        }
    ], false, adminSuggestionData, async (interaction) => {
        if(!(interaction.member instanceof GuildMember)) {
            interaction.reply({content: mainMessages.general_error, flags: ephemeralFlag(adminSuggestionData.responesEphemeral)});
            return;
        }

        const suggestionId = interaction.options.get("id", true).value as number
        const suggestion = SuggestionManager.searchSuggestion(suggestionId);

        await interaction.deferReply({flags: ephemeralFlag(adminSuggestionData.responesEphemeral)});

        if(!suggestion) {
            interaction.editReply({content: suggestionData.messages.notfound});
            return;
        }

        const answer = interaction.options.get("answer", true).value as "approved" | "denined";
        const answerEnum = answer == "approved" ? AdminResult.Approved : AdminResult.Denied;

        const suggestionChannel = channelMap.get("suggestions");
        
        if(suggestionChannel == undefined || suggestionChannel.type != ChannelType.GuildText) {
            interaction.editReply({content: mainMessages.general_error + " channel"});
            return;
        }

        const message = await suggestionChannel.messages.fetch(suggestion.getMessage())

        if(!message) {
            interaction.editReply({content: suggestionData.messages.notfound + " message"});
            return;
        }

        console.log("Found meesage")
        
        const suggesters = suggestion.getSuggesters();

        const result = await database.execute("UPDATE `suggestions` SET `admin` = ?, `adminResult` = ? WHERE `id` = ?", [
            interaction.user.id,
            answerEnum,
            suggestionId
        ]).then(() => {
            return true;
        }).catch(() => {
            return false;
        })

        if(result) {
            placeholderText(interaction.member, adminSuggestionData.embedStates.suggestionanswered, {
                author: "<@" + suggestion.getAuthor() + ">",
                authorName: interaction.guild?.members.cache.get(suggestion.getAuthor())?.displayName ?? "UNK",
                suggestionAnswer: answer.charAt(0).toUpperCase() + answer.slice(1, answer.length),
                suggestionId: suggestionId,
                suggestionText: suggestion.getText(),
                upvotes: suggesters.upvote.length,
                downvotes: suggesters.downvote.length,
                upvotesText: "",
                downvotesText: ""
            }, (newEmbed) => {
                message.edit({embeds: [newEmbed], components: []});
                interaction.editReply({content: "Done!"})
            })
        } else {
            interaction.editReply({content: "db update"})
        }
    })



}

export default RegisterCommands;