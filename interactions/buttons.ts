import type { ButtonInteraction } from "discord.js";
import suggestionData from "../config/features/suggestion.json"
import SuggestionManager, { SuggestionFeedback } from "../structures/features/Suggestions/SuggestionManager";
import { ephemeralFlag } from "../utils";

const handleFeedback = async (interaction: ButtonInteraction) => {
    const type = interaction.customId == "suggestion_upvote" ? SuggestionFeedback.Upvote : SuggestionFeedback.Downvote;
    const suggestion = SuggestionManager.searchSuggestion(interaction.message.id);

    if(suggestion == null) {
        interaction.reply({content: suggestionData.messages["notfound"], flags: ephemeralFlag(suggestionData.responesEphemeral)});
        return;
    }

    const resultText = await suggestion.setFeedback(interaction.user.id, interaction.message, type);

    interaction.reply({content: resultText, flags: ephemeralFlag(suggestionData.responesEphemeral)})
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