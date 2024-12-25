import getBaseEmbed from "../config/embed";
import { status as statusData } from "../config/messages.json"
import { getServerInfoFormatted } from "../structures/serverListener";
import type { Command } from "../types"
import { formatEmbed, formatJsonString } from "../utils";

export default new Map<string | string[], Command>([
    [
        ["status", "ip"],
        {
            description: "A command to see the server status and ip",
            onInteract: async (interaction) => {
                await interaction.deferReply({ephemeral: true});

                const data = getServerInfoFormatted();
                const embed = getBaseEmbed();

                const embedData = data ? statusData.changeTo.online : statusData.changeTo.offline;
                const newEmbed = formatJsonString(JSON.stringify(embedData), data);

                interaction.editReply({embeds: [formatEmbed(embed, newEmbed)]})
            }
        }
    ]
])
