import type { ModalSubmitInteraction } from "discord.js"
import type { ResultSetHeader } from "mysql2";
import { ChannelType, GuildMember } from "discord.js"

import channelMap from "../structures/channelManager";
import database from "../structures/database";

import { placeholderText } from "./main";
import { ephemeralFlag } from "../utils";

import mainMessages from "../config/messages.json"
import suggestionData from "../config/features/suggestion.json"

export default new Map<string, (interaction: ModalSubmitInteraction) => void>([
    [
        "suggestion",
        async (interaction) => {
            if(!(interaction.member instanceof GuildMember)) return;

            await interaction.deferReply({flags: ephemeralFlag(suggestionData.responesEphemeral)})
            const suggestionText = interaction.fields.getTextInputValue("suggestion_text");

            if(suggestionText.length > 256) {
                placeholderText(interaction.member, suggestionData.embedStates.channelNotFound, null, (newContent) => {
                    interaction.editReply({embeds: [newContent]})
                });

                return;
            }

            const suggestionChannel = channelMap.get("suggestions");

            if(suggestionChannel == undefined || suggestionChannel.type != ChannelType.GuildText) {
                placeholderText(interaction.member,
                    suggestionData.embedStates.channelNotFound,
                    {
                        suggestionText: suggestionText,
                        suggestionId: 0,
                        upvotes: 0,
                        downvotes: 0
                    },
                    (newContent) => {
                        interaction.editReply({embeds: [newContent]})
                    }
                );

                return;
            }

            database.execute<ResultSetHeader>("INSERT INTO `suggestions`(`author`, `text`) VALUES(?, ?)", [
                interaction.user.id,
                suggestionText
            ]).then((result) => {
                const suggestionId = result[0].insertId;

                placeholderText(interaction.member as GuildMember,
                    suggestionData.embedStates.suggestion,
                    {
                        suggestionId,
                        suggestionText: suggestionText,
                        upvotes: 0,
                        downvotes: 0
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
                                interaction.editReply({content: suggestionData.messages["created_succesfully"]});
                            }).catch(() => {
                                message.delete();
                                interaction.editReply({content: mainMessages.general_error});
                            })
                        }).catch(() => {
                            interaction.editReply({content: mainMessages.general_error});
                        })
                    }
                );
            })
        }
    ]
])