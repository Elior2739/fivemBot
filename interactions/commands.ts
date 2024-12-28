import getBaseEmbed from "../config/embed";
import { status as statusData } from "../config/messages.json"
import { getServerInfoFormatted } from "../structures/serverListener";
import type { BasePlaceholders, Command, ServerPlaceholders } from "../types"
import { formatEmbed, formatJsonString } from "../utils";

export default new Map<string | string[], Command>([
    [
        ["status", "ip"],
        {
            description: "A command to see the server status and ip",
            default_member_permissions: statusData.allowed.permission,
            onInteract: async (interaction) => {
                await interaction.deferReply({ephemeral: statusData.ephemeral});


                const data = getServerInfoFormatted();
                const embed = getBaseEmbed();

                const embedData = data ? statusData.changeTo.online : statusData.changeTo.offline;
                const newEmbed = formatJsonString(JSON.stringify(embedData), data);

                interaction.editReply({embeds: [formatEmbed(embed, newEmbed)]})
            }
        }
    ],
    [
        "placeholders",
        {
            description: "A command to show all placeholders",
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
    ]
])
