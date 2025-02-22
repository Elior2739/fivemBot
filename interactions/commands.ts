import getBaseEmbed from "../config/embed";
import { status as statusData, suggest as suggestionData } from "../config/commands.json"
import { getServerInfoFormatted } from "../structures/serverListener";
import type { BasePlaceholders, Command, CommandData, ServerPlaceholders } from "../types"
import { formatEmbed, formatJsonString } from "../utils";


export default new Map<string | string[], Command>([
    [
        ["status", "ip"],
        {
            description: "A command to see the server status and ip",
            default_member_permissions: (statusData.permission.type === "permission" ? statusData.permission.value : undefined),
            commandData: statusData,

            onInteract: async (interaction) => {
                await interaction.deferReply({ephemeral: statusData.ephemeral});


                const data = getServerInfoFormatted();
                const embed = getBaseEmbed();

                const embedData = data ? statusData.embedStates.online : statusData.embedStates.offline;
                const newEmbed = formatJsonString(JSON.stringify(embedData), data);

                interaction.editReply({embeds: [formatEmbed(embed, newEmbed)]})
            }
        }
    ],
    [
        "placeholders",
        {
            description: "A command to show all placeholders",
            default_member_permissions: "Administrator",
            onInteract: (interaction) => {

                const data = getServerInfoFormatted();
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
                interaction.showModal(suggestionData.modal);
            }
        }
    ]
])
