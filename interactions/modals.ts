import type { ModalSubmitInteraction } from "discord.js"
import { suggest as suggestionData } from "../config/commands.json"


export default new Map<string, (interaction: ModalSubmitInteraction) => void>([
    [
        "suggest",
        (interaction) => {
            const suggestionText = interaction.fields.getTextInputValue("suggestion_text");

            if(suggestionText.length > 256) {
                interaction.reply({ephemeral: true, embeds: [suggestionData.embedStates.tooLong]})
                return;
            }

            

        }
    ]
])