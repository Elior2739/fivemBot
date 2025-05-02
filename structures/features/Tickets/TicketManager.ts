import { CategoryChannel, ChannelType } from "discord.js";
import type { TicketsSQLResult, TicketCategoriesSQLResult } from "../../../types";
import { query } from "../../database";
import MultipleKeyValue from "../../MultipleKeyValue";
import Ticket from "./Ticket";
import client from "../../client";

enum TicketState {
    Open = 1,
    Closed = 2
}

export default new class {


    private tickets = new MultipleKeyValue<Ticket>();
    private categoties = new MultipleKeyValue<{
        name: string;
        category: CategoryChannel
    }>

    constructor() {}

    async fetchTickets() {
        const categories = await query<TicketCategoriesSQLResult>("SELECT `id`, `channel`, `name` FROM `ticket_categories`", []);
        if(!categories) return; // TODO: Log, Debug, Bye.
        
        for(let index = 0; index < categories.length; index++) {
            const categoryRaw = categories[index];
            const channel = client.channels.cache.get(categoryRaw.channel);
            
            if(!channel || channel.type != ChannelType.GuildCategory) {
                // TODO: Log, Debug, Bye.
                continue;
            }
            
            this.categoties.set([categoryRaw.channel, categoryRaw.id], {
                name: categoryRaw.name,
                category: channel
            })
        }

        const tickets = await query<TicketsSQLResult>("SELECT `id`, `category`, `author`, `channel`, `state` FROM `tickets`", []);
        if(!tickets) return; // TODO: Log, Debug, Bye.

        for(let index = 0; index < tickets.length; index++) {
            const ticketRaw = tickets[index];
            const category = this.categoties.searchValue(ticketRaw.id);

            if(!category) {
                // TODO: Log, Debug, Bye.
                continue;
            }

            this.addTicket(
                ticketRaw.id,
                ticketRaw.category,
                ticketRaw.author,
                ticketRaw.channel,
                ticketRaw.state
            )
        }

    }

    addTicket(id: number, cateogry: number, author: string, channel: string, state: TicketState) {
        const ticket = new Ticket(
            id,
            cateogry,
            author,
            channel,
            state
        )

        this.tickets.set([id, channel], ticket)
    }

    addCategory(id: number, category: CategoryChannel, name: string) {
        this.categoties.set([id, category.id], {
            name,
            category,
        })
    }

    searchTicket(identifier: string | number): Ticket | undefined {
        return this.tickets.searchValue(identifier);
    }

    getCategories() {
        return this.categoties;
    }
}

export {
    TicketState
}