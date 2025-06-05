import { GuildMember, TextChannel, type ButtonInteraction } from "discord.js";
import suggestionData from "../../config/features/suggestion.json"
import ticketsData from "../../config/features/tickets.json"
import ticketsDataAdmin from "../../config/features/ticketsAdmin.json"

import SuggestionManager, { SuggestionFeedback } from "../../structures/features/Suggestions/SuggestionManager";
import { ephemeralFlag } from "../../utils";
import TicketManager, { TicketState } from "../../structures/features/Tickets/TicketManager";
import InteractionManager, { InternalInteractionType } from "../../structures/InteractionManager";
import mainMessages from "../../config/messages.json"
import Ticket from "../../structures/features/Tickets/Ticket";
import client from "../../structures/client";

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
        if(!(interaction.member instanceof GuildMember)) return interaction.reply({content: mainMessages.general_error, flags: "Ephemeral"});

        const cateogires = [];
        const values = TicketManager.getCategories().getValues();

        if(values.length == 0) {
            interaction.reply({content: "No categories were set, Please try again later.", flags: "Ephemeral"});
            return;
        }

        if (ticketsData.settings.category_based && values.length > 1) {
            for(let index = 0; index < values.length; index++) {
                const category = values[index];

                cateogires.push({
                    label: category.getName(),
                    value: category.getCategory().id
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

        TicketManager.createTicket(interaction, values[0].getCategory(), interaction.member);
    });

    InteractionManager.registerHandler("ticket_close", ticketsData, InternalInteractionType.Button, (interaction) => {
        if(interaction.channel == undefined) {
            interaction.reply({content: mainMessages.general_error, flags: "Ephemeral"});
            return;
        }

        const ticket: Ticket | undefined = TicketManager.searchTicket(interaction.channel.id);

        if(ticket == undefined) {
            interaction.reply({content: mainMessages.general_error, flags: ephemeralFlag(ticketsData.responesEphemeral)});
            return;
        }
        if(!(interaction.member instanceof GuildMember)) {
            interaction.reply({content: mainMessages.general_error, flags: ephemeralFlag(ticketsData.responesEphemeral)});
            return;
        }

        const allowedRoles = ticket.getCategory().getRoles();
        let isAllowed = false;

        for(let index = 0; index < allowedRoles.length; index++) {
            const role = allowedRoles[index];

            if(interaction.member.roles.cache.has(role)) {
                isAllowed = true;
                break;
            }
        }

        if(!isAllowed) {
            interaction.reply({content: "You aren't allowed to use this.", flags: ephemeralFlag(ticketsData.responesEphemeral)});
            return;
        }

        interaction.showModal({
            "custom_id": "ticket_close_modal",
            "title": ticketsDataAdmin.modal.modalTitle,
            "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 4,
                            "custom_id": "close_reason",
                            "label": ticketsDataAdmin.modal.modalInputLabel,
                            "style": 2,
                            "max_length": 256
                        }
                    ]
                }
            ]
        });
    })

    InteractionManager.registerHandler("ticket_lock", ticketsDataAdmin, InternalInteractionType.Button, async (interaction) => {
        if(!interaction.channel || !(interaction.channel instanceof TextChannel)) return;

        if(!ticketsData.settings.enable_lock) {
            interaction.reply({content: mainMessages.general_error, flags: "Ephemeral"});
            return;
        }

        const ticket = TicketManager.searchTicket(interaction.channel.id);
        if(ticket == undefined) {
            interaction.reply({content: mainMessages.general_error, flags: "Ephemeral"});
            return;
        }

        if(ticket.getState() == TicketState.Closed) {
            interaction.reply({content: mainMessages.general_error, flags: "Ephemeral"});
            return;
        }

        client.users.fetch(ticket.getAuthor()).then((user) => {
            user.send({content: "Your ticket has been locked"});
        })

        const setStateStatus = await ticket.setState(TicketState.Closed);

        if(!setStateStatus) {
            interaction.reply({content: "Failed to set ticket's state", flags: "Ephemeral"});
            return
        }

        interaction.channel.permissionOverwrites.edit(ticket.getAuthor(), {
            SendMessages: false
        })

        interaction.reply({content: "The ticket is now locked"});
    })

}

export default Buttons;