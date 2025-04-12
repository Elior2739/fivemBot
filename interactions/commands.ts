import { GuildMember } from "discord.js";
import { getServerInfoFormatted } from "../structures/serverListener";
import statusData from "../config/features/status.json"
import suggestionData from "../config/features/suggestion.json"
import { ephemeralFlag, } from "../utils";
import { placeholderText } from "./main";
import CommandManager from "../structures/commands/CommandManager";
import mainMessages from "../config/messages.json"


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

}

export default RegisterCommands;