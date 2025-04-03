import type { ButtonInteraction } from "discord.js";
import suggestions from "../structures/features/suggestions";
import messages from "../config/messages.json"
import { SuggestionFeedback } from "../structures/features/suggestions";

const cooldowns: {[key: string]: number} = {};


const handleFeedback = async (interaction: ButtonInteraction) => {
    if(cooldowns[interaction.user.id] && (Date.now() - cooldowns[interaction.user.id]) < 0) return interaction.reply({content: messages["cooldown"], flags: ["Ephemeral"]});

    cooldowns[interaction.user.id] = Date.now() + 10000;
    const type = interaction.customId == "suggestion_upvote" ? SuggestionFeedback.Upvote : SuggestionFeedback.Downvote;
    const suggestion = suggestions.get(interaction.message.id);

    if(suggestion == null) {
        interaction.reply({content: messages["suggestion_notfound"], flags: ["Ephemeral"]});
        return;
    }

    const resultText = await suggestion.setFeedback(interaction.user.id, interaction.message, type);

    interaction.reply({content: resultText, flags: ["Ephemeral"]})
}

export default new Map<string, (interaction: ButtonInteraction) => void>([
    [
        "suggestion_upvote",
        handleFeedback
    ],
    [
        "suggestion_downvote",
        handleFeedback
    ]
])