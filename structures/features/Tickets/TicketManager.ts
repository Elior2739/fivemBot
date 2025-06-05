import { ButtonInteraction, CategoryChannel, ChannelType, ChatInputCommandInteraction, GuildMember, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuInteraction, type AnySelectMenuInteraction, type APIEmbed, type BaseMessageOptions, type Interaction, type OverwriteResolvable } from "discord.js";
import type { TicketsSQLResult, TicketCategoriesSQLResult } from "../../../types";
import database, { query } from "../../database";
import MultipleKeyValue from "../../MultipleKeyValue";
import Ticket from "./Ticket";
import client from "../../client";
import Category from "./Category";
import { placeholderText } from "../../../utils";
import ticketsData from "../../../config/features/tickets.json"
import type { ResultSetHeader } from "mysql2";

enum TicketState {
    Open = 1,
    Locked = 2,
    Closed = 3
}

export default new class {


    private tickets = new MultipleKeyValue<Ticket>();
    private categoties = new MultipleKeyValue<Category>

    constructor() { }

    async fetchTickets() {
        const categories = await query<TicketCategoriesSQLResult>("SELECT `id`, `channel`, `name`, `role` FROM `ticket_categories` LEFT JOIN `ticket_categories_permissions` ON `category` = `id`", []);
        if (!categories) return; // TODO: Log, Debug, Bye.

        for (let index = 0; index < categories.length; index++) {
            const categoryRaw = categories[index];
            const channel = client.channels.cache.get(categoryRaw.channel);

            if (!channel || channel.type != ChannelType.GuildCategory) {
                // TODO: Log, Debug, Bye.
                continue;
            }

            const roles = [];

            if (categoryRaw.role != undefined) {
                const innerCategory = this.categoties.searchValue(categoryRaw.id);

                if (innerCategory) {
                    innerCategory.getRoles().push(categoryRaw.role)
                    continue;
                } else {
                    roles.push(categoryRaw.role)
                }
            }

            this.categoties.set([categoryRaw.channel, categoryRaw.id], new Category(categoryRaw.id, categoryRaw.name, channel, roles));
        }

        const tickets = await query<TicketsSQLResult>("SELECT `id`, `category`, `author`, `channel`, `state` FROM `tickets` WHERE `state` = ? OR `state` = ?", [
            TicketState.Open,
            TicketState.Closed
        ]);
        if (!tickets) return; // TODO: Log, Debug, Bye.

        for (let index = 0; index < tickets.length; index++) {
            const ticketRaw = tickets[index];
            const category = this.categoties.searchValue(ticketRaw.id);

            if (!category) {
                // TODO: Log, Debug, Bye.
                continue;
            }

            this.addTicket(
                ticketRaw.id,
                this.categoties.searchValue(ticketRaw.category) as Category,
                ticketRaw.author,
                ticketRaw.channel,
                ticketRaw.state
            )
        }

    }

    private async replyToInteraction(data: BaseMessageOptions, isSelectMenu: boolean, interaction: ButtonInteraction | StringSelectMenuInteraction) {
        if (isSelectMenu) {
            interaction.update(data);
        } else {
            if (!interaction.deferred) {
                await interaction.deferReply({ flags: "Ephemeral" });
            }

            interaction.editReply(data);
        }
    }

    async createTicket(interaction: ButtonInteraction | StringSelectMenuInteraction, category: CategoryChannel, member: GuildMember) {
        if (!(interaction.member instanceof GuildMember)) {
            return; // TODO: Log, Debug, Bye.
        }

        const isSelectMenu = interaction.isStringSelectMenu();

        const ticket = this.searchTicket(interaction.user.id);
        if (ticket != undefined) {
            this.replyToInteraction({ content: "You already have a ticket", components: [] }, isSelectMenu, interaction);
            return;
        }

        const innerCategory = this.categoties.searchValue(category.id);
        const extendedPermissions: OverwriteResolvable[] = [];

        if (innerCategory == undefined) {
            this.replyToInteraction({ content: "How tf did you got here.", components: [] }, isSelectMenu, interaction);
            return;
        }

        const roles = innerCategory.getRoles();
        for (let index = 0; index < roles.length; index++) {
            extendedPermissions.push({
                "allow": ["ViewChannel", "SendMessages"],
                "id": roles[index]
            })
        }

        const channel = await member.guild.channels.create({
            parent: category,
            name: "ticket-" + member.user.username,
            permissionOverwrites: [
                {
                    "allow": ["ViewChannel", "SendMessages"],
                    "id": member.id
                },
                {
                    deny: ["ViewChannel", "SendMessages"],
                    id: member.guild.roles.everyone
                },
                ...extendedPermissions
            ]
        }).then((channel) => channel).catch(err => undefined);

        if (channel == undefined) {
            this.replyToInteraction({ content: "Failed to open a ticket (1)", components: [] }, isSelectMenu, interaction)
            return;
        }

        const embed = placeholderText(interaction.member, ticketsData.embedStates.ticket, {
            channelId: channel.id
        });

        const comps = [
            {
                type: 2,
                custom_id: "ticket_close",
                label: ticketsData.buttons.close.text,
                style: ticketsData.buttons.close.style,
            }
        ];

        if (ticketsData.settings.enable_lock) {
            comps.push({
                type: 2,
                custom_id: "ticket_lock",
                label: ticketsData.buttons.lock.text,
                style: ticketsData.buttons.lock.style,
            })
        }


        const message = await channel.send({
            embeds: [embed], components: [{
                type: 1,
                components: comps
            }]
        }).then(message => message).catch(err => undefined);

        if (message == undefined) {
            channel.delete("Failed to open a ticket");
            this.replyToInteraction({ content: "Failed to open a ticket (2)", components: [] }, isSelectMenu, interaction)
            return;
        }


        const ticketId = await database.execute<ResultSetHeader>("INSERT INTO `tickets`(`category`, `author`, `channel`) VALUES(?, ?, ?)", [
            innerCategory.getId(),
            interaction.user.id,
            channel.id
        ]).then(res => res[0].insertId).catch(err => undefined);

        if (!ticketId) {
            channel.delete("Failed to open a ticket (3)");
            this.replyToInteraction({ content: "Failed to open a ticket (3)", components: [] }, isSelectMenu, interaction);
            return;
        }

        this.replyToInteraction({ content: "Created a ticket succesfully!, Here: <#" + channel.id + ">", components: [] }, isSelectMenu, interaction);
        this.addTicket(ticketId, innerCategory, interaction.user.id, channel.id, TicketState.Open);
    }

    addTicket(id: number, cateogry: Category, author: string, channel: string, state: TicketState) {
        const ticket = new Ticket(
            id,
            cateogry,
            author,
            channel,
            state
        )

        this.tickets.set([id, channel, author], ticket)
    }

    addCategory(id: number, category: CategoryChannel, name: string) {
        this.categoties.set([id, category.id], new Category(id, name, category, []));
    }

    searchTicket(identifier: string | number): Ticket | undefined {
        return this.tickets.searchValue(identifier);
    }

    getCategories() {
        return this.categoties;
    }

    removeTicket(identifier: string | number) {
        return this.tickets.delete(identifier);
    }
}

export {
    TicketState
}