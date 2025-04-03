import {  ActionRow, ActionRowBuilder, ButtonBuilder, ChannelType, GuildMember, type ActionRowData, type APIMessageActionRowComponent, type MessageActionRowComponentBuilder, type ModalSubmitInteraction } from "discord.js"
import { suggest as suggestionData } from "../config/commands.json"
import channelMap from "../structures/channelManager";
import { placeholderText } from "./main";
import database from "../structures/database";
import type { ResultSetHeader } from "mysql2";

export default new Map<string, (interaction: ModalSubmitInteraction) => void>([
    [
        "suggestion",
        async (interaction) => {
            if(!(interaction.member instanceof GuildMember)) return;

            await interaction.deferReply({flags: (suggestionData.responesEphemeral ? ["Ephemeral"] : [])})
            const suggestionText = interaction.fields.getTextInputValue("suggestion_text");

            if(suggestionText.length > 256) {
                placeholderText(interaction.member, suggestionData.embedStates.channelNotFound, null, (newContent) => {
                    interaction.editReply({embeds: [newContent]})
                });;
                return;
            }

            const suggestionChannel = channelMap.get("suggestions");

            if(suggestionChannel == undefined || suggestionChannel.type != ChannelType.GuildText) {
                placeholderText(interaction.member,
                    suggestionData.embedStates.channelNotFound,
                    { // Extra Data
                        suggestion: suggestionText,
                        suggestionId: 0
                    },
                    (newContent) => {
                        interaction.editReply({embeds: [newContent]})
                    }
                );

                return;
            }

            database.execute<ResultSetHeader>("INSERT INTO `suggestions`(`author`) VALUES(?)", [
                interaction.user.id
            ]).then((result) => {
                const suggestionId = result[0].insertId;

                placeholderText(interaction.member as GuildMember,
                    suggestionData.embedStates.suggestion,
                    { // Extra Data
                        suggestionId,
                        suggestionText: suggestionText
                    },
                    (newContent) => {
                        suggestionChannel.send({embeds: [newContent], components: [{
                            type: 1,
                            components: [
                              {
                                type: 2,
                                custom_id: "suggestion_upvote",
                                label: suggestionData.buttons.upvote.text,
                                style: suggestionData.buttons.upvote.style,
                              }, {
                                type: 2,
                                custom_id: "suggestion_downvote",
                                label: suggestionData.buttons.downvote.text,
                                style: suggestionData.buttons.downvote.style,
                              }
                            ],
                          }]}).then((message) => {
                            database.execute("UPDATE `suggestions` SET `message` = ? WHERE `id` = ?", [
                                message.id,
                                suggestionId
                            ]).then(() => {
                                interaction.editReply({content: "Done"});
                            }).catch(() => {
                                message.delete();
                                interaction.editReply({content: "Error Occurred!"});
                            })
                        }).catch(() => {
                            interaction.editReply({content: "Error Occurred!"});
                        })
                    }
                );
            })
        }
    ]
])