import { CategoryChannel, TextChannel, type Channel } from "discord.js";
import TicketManager from "../structures/features/Tickets/TicketManager";

const handler = async (channel: Channel) => {
    if(channel instanceof TextChannel) {
        const ticket = TicketManager.searchTicket(channel.id);
        if(ticket) {
            // TODO: Delete ticket
        }
    } else if(channel instanceof CategoryChannel) {
        const category = TicketManager.getCategories().searchValue(channel.id);
        if(category) {
            // TODO: Delete category
        }
    }

}

export { handler }