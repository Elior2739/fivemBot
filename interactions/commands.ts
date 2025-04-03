import getBaseEmbed from "../config/embed";
import { status as statusData, suggest as suggestionData } from "../config/commands.json"
import { getServerInfoFormatted } from "../structures/serverListener";
import type { BasePlaceholders, Command,  ServerPlaceholders } from "../types"
import { formatEmbed, placeholderString } from "../utils";
import { GuildMember, type APIEmbed } from "discord.js";
import { getPlaceholderData, placeholderText } from "./main";

 
export default new Map<string | string[], Command>([
    [
        ["status", "ip"],
        {
            description: "A command to see the server status and ip",
            default_member_permissions: (statusData.permission.type === "permission" ? statusData.permission.value : undefined),
            commandData: statusData,

            onInteract: async (interaction) => {
                if(!(interaction.member instanceof GuildMember)) return;

                await interaction.deferReply({ephemeral: statusData.responesEphemeral});

                const data = getServerInfoFormatted();
                const embed = getBaseEmbed();

                const embedData = data ? statusData.embedStates.online : statusData.embedStates.offline;

                placeholderText(interaction.member, embedData as APIEmbed, null, (newEmbed) => {
                    interaction.editReply({embeds: [formatEmbed(embed, newEmbed)]})
                })

            }
        }
    ],
    [
        "placeholders",
        {
            description: "A command to show all placeholders",
            default_member_permissions: "Administrator",
            onInteract: (interaction) => {

                const data = getPlaceholderData(interaction.member as GuildMember, {
                    suggestionId: 0,
                    suggestion: "Example for suggestion"
                });
                const embed = getBaseEmbed();

                const dataKeys = Object.keys(data);
                let str = "";

                for(let index = 0; index < dataKeys.length; index++) {
                    const key = dataKeys[index] as keyof (BasePlaceholders | ServerPlaceholders);

                    str += key + " - " + data[key] + "\n";
                }

                embed.setDescription(str);

                interaction.reply({embeds: [embed]});

            }
        }
    ],
    [
        "suggest",
        {
            description: "Suggest something to the server",
            default_member_permissions: (statusData.permission.type === "permission" ? statusData.permission.value : undefined),
            onInteract: async (interaction) => {
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
            }
        }
    ]
])
