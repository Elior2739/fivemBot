import { GuildMember } from "discord.js";
import TicketManager from "../../structures/features/Tickets/TicketManager";
import InteractionManager, { InternalInteractionType } from "../../structures/InteractionManager";

const SelectMenus = () => {
    InteractionManager.registerHandler("ticket_open", undefined, InternalInteractionType.SelectMenu, async (interaction) => {
        if(!interaction.isStringSelectMenu()) return interaction.reply({content: "Invalid select menu type", flags: "Ephemeral"});
        if(!(interaction.member instanceof GuildMember)) return;
    
        const categoryChannelId = interaction.values[0];
        const categoryData = TicketManager.getCategories().searchValue(categoryChannelId);

        if(categoryData == undefined) {
            return;
        }

        TicketManager.createTicket(interaction, categoryData.getCategory(), interaction.member);
    })
}

export default SelectMenus;