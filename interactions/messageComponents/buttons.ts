import type { ButtonInteraction } from "discord.js";
import suggestionData from "../../config/features/suggestion.json"
import ticketAdminData from "../../config/features/ticketsAdmin.json"

import SuggestionManager, { SuggestionFeedback } from "../../structures/features/Suggestions/SuggestionManager";
import { ephemeralFlag } from "../../utils";
import TicketManager from "../../structures/features/Tickets/TicketManager";
import InteractionManager, { InternalInteractionType } from "../../structures/InteractionManager";

const handleFeedback = async (interaction: ButtonInteraction) => {
    const type = interaction.customId == "suggestion_upvote" ? SuggestionFeedback.Upvote : SuggestionFeedback.Downvote;
    const suggestion = SuggestionManager.searchSuggestion(interaction.message.id);

    if (suggestion == null) {
        interaction.reply({ content: suggestionData.messages["notfound"], flags: ephemeralFlag(suggestionData.responesEphemeral) });
        return;
    }

    const resultText = await suggestion.setFeedback(interaction.user.id, interaction.message, type);

    interaction.reply({ content: resultText, flags: ephemeralFlag(suggestionData.responesEphemeral) })
}

const Buttons = () => {
    InteractionManager.registerHandler("suggestion_upvote", suggestionData, InternalInteractionType.Button, handleFeedback);
    InteractionManager.registerHandler("suggestion_downvote", suggestionData, InternalInteractionType.Button, handleFeedback);

    InteractionManager.registerHandler("ticket_categories", suggestionData, InternalInteractionType.Button, (interaction) => {
        if (ticketAdminData.settings.category_based) {
            const cateogires = [];
            const values = TicketManager.getCategories().getValues();

            if(values.length == 0) {
                interaction.reply({content: "No categories were set, Please try again later.", flags: "Ephemeral"});
                return;
            }

            for(let index = 0; index < values.length; index++) {
                const category = values[index];

                cateogires.push({
                    label: category.name,
                    value: category.category.id
                })
            }
            
            interaction.reply({
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                placeholder: "Select Category",
                                custom_id: "ticket_open",
                                options: cateogires,
                            }
                        ]
                    }
                ], flags: "Ephemeral"
            })

            return;
        }
    });


}

export default Buttons;