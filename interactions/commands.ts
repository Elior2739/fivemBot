import { ApplicationCommandOptionType, CategoryChannel, ChannelType, ComponentAssertions, GuildMember, type GuildBasedChannel } from "discord.js";
import { getServerInfoFormatted } from "../structures/serverListener";
import statusData from "../config/features/status.json"
import suggestionData from "../config/features/suggestion.json"
import adminSuggestionData from "../config/features/suggestionAdmin.json"
import ticketsAdmin from "../config/features/ticketsAdmin.json"
import setupChannels from "../config/features/setupChannels.json"
import { ephemeralFlag, } from "../utils";
import { placeholderText } from "../utils";
import CommandManager from "../structures/commands/CommandManager";
import mainMessages from "../config/messages.json"
import SuggestionManager, { AdminResult } from "../structures/features/Suggestions/SuggestionManager";
import channelMap from "../structures/channelManager";
import database from "../structures/database";
import TicketManager from "../structures/features/Tickets/TicketManager";
import type { ResultSetHeader } from "mysql2/promise";
import Category from "../structures/features/Tickets/Category";
import Ticket from "../structures/features/Tickets/Ticket";


const RegisterCommands = () => {
    const ChoicesToType: Record<string, ChannelType> = {
        "suggestions": ChannelType.GuildText
    }

    CommandManager.registerCommand(["status", "ip"], "View the server's status and ip", [], false, undefined, undefined, statusData, async (interaction) => {
        if (!(interaction.member instanceof GuildMember)) {
            interaction.reply({ content: mainMessages["general_error"], flags: "Ephemeral" });
            return;
        }

        await interaction.deferReply({ flags: ephemeralFlag(statusData.responesEphemeral) });

        const serverInfo = getServerInfoFormatted();
        const embedStyle = serverInfo.serverOnline ? statusData.embedStates.online : statusData.embedStates.offline;

        const newEmbed = placeholderText(interaction.member, embedStyle, null);
        interaction.editReply({ embeds: [newEmbed] });
    });

    CommandManager.registerCommand("suggest", "Suggest a suggestion", [], false, undefined, undefined, suggestionData, (interaction) => {
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
    });

    CommandManager.registerCommand("view-suggestion", "A command to view suggestion's votes", [
        {
            name: "id",
            description: "Suggestion ID",
            type: 4,
            required: true
        }
    ], false, undefined, undefined, adminSuggestionData, async (interaction) => {
        if (!(interaction.member instanceof GuildMember)) {
            interaction.reply({ content: mainMessages.general_error, flags: ephemeralFlag(adminSuggestionData.responesEphemeral) });
            return;
        }

        const suggestionId = interaction.options.getNumber("id", true);
        const suggestion = SuggestionManager.searchSuggestion(suggestionId);

        await interaction.deferReply({ flags: ephemeralFlag(adminSuggestionData.responesEphemeral) });

        if (!suggestion) {
            interaction.editReply({ content: suggestionData.messages.notfound });
            return;
        }

        const suggesters = suggestion.getSuggesters();
        let upvotes = "";
        let downvotes = "";

        for (let index = 0; index < suggesters.upvote.length; index++) {
            upvotes += "<@" + suggesters.upvote[index] + ">\\n"
        }

        for (let index = 0; index < suggesters.downvote.length; index++) {
            downvotes += "<@" + suggesters.downvote[index] + ">\\n"
        }

        const newEmbed = placeholderText(interaction.member, adminSuggestionData.embedStates.viewvotes, {
            suggestionId: suggestion.getId(),
            suggestionText: suggestion.getText(),
            upvotes: suggesters.upvote.length,
            downvotes: suggesters.downvote.length,
            upvotesText: upvotes,
            downvotesText: downvotes
        });

        interaction.editReply({ embeds: [newEmbed] })
    });

    CommandManager.registerCommand("answer-suggestion", "Answer to a suggestion", [
        {
            name: "id",
            description: "Suggestion ID",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "answer",
            description: "The answer for the suggestion",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Approved",
                    value: "approved"
                },
                {
                    name: "Denied",
                    value: "denied"
                }
            ]
        }
    ], false, undefined, undefined, adminSuggestionData, async (interaction) => {
        if (!(interaction.member instanceof GuildMember)) {
            interaction.reply({ content: mainMessages.general_error, flags: ephemeralFlag(adminSuggestionData.responesEphemeral) });
            return;
        }

        const suggestionId = interaction.options.getNumber("id", true)
        const suggestion = SuggestionManager.searchSuggestion(suggestionId);

        await interaction.deferReply({ flags: ephemeralFlag(adminSuggestionData.responesEphemeral) });

        if (!suggestion) {
            interaction.editReply({ content: suggestionData.messages.notfound });
            return;
        }

        const answer = interaction.options.getString("answer", true) as "approved" | "denined";
        const answerEnum = answer == "approved" ? AdminResult.Approved : AdminResult.Denied;

        const suggestionChannel = channelMap.get("suggestions");

        if (suggestionChannel == undefined || suggestionChannel.type != ChannelType.GuildText) {
            interaction.editReply({ content: mainMessages.general_error + " channel" });
            return;
        }

        const message = await suggestionChannel.messages.fetch(suggestion.getMessage())

        if (!message) {
            interaction.editReply({ content: suggestionData.messages.notfound });
            return;
        }

        const suggesters = suggestion.getSuggesters();

        const result = await database.execute("UPDATE `suggestions` SET `admin` = ?, `adminResult` = ? WHERE `id` = ?", [
            interaction.user.id,
            answerEnum,
            suggestionId
        ]).then(() => {
            return true;
        }).catch(() => {
            return false;
        })

        if (result) {
            const newEmbed = placeholderText(interaction.member, adminSuggestionData.embedStates.suggestionanswered, {
                author: "<@" + suggestion.getAuthor() + ">",
                authorName: interaction.guild?.members.cache.get(suggestion.getAuthor())?.displayName ?? "UNK",
                suggestionAnswer: answer.charAt(0).toUpperCase() + answer.slice(1, answer.length),
                suggestionId: suggestionId,
                suggestionText: suggestion.getText(),
                upvotes: suggesters.upvote.length,
                downvotes: suggesters.downvote.length,
                upvotesText: "",
                downvotesText: ""
            })
            message.edit({ embeds: [newEmbed], components: [] });
            SuggestionManager.removeSuggestion(suggestionId);
            interaction.editReply({ content: "Done!" })
        } else {
            interaction.editReply({ content: "db update" })
        }
    });

    CommandManager.registerCommand("setup-channel", "Setup channels", [
        {
            name: "channel_name",
            description: "The channel's key",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Suggestions",
                    value: "suggestions"
                }
            ]
        },
        {
            name: "channel",
            description: "The channel",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        }
    ], false, undefined, undefined, setupChannels, async (interaction) => {
        const key = interaction.options.getString("channel_name", true)
        const channel = interaction.options.getChannel("channel", true)

        await interaction.deferReply({ flags: ephemeralFlag(setupChannels.responesEphemeral) });

        if (channel.type != ChoicesToType[key] && ((channel.type < 1 || channel.type < 4) && channel.type != 1)) {
            interaction.editReply({ content: "Invalid channel type. Got: " + ChannelType[channel?.type ?? 0] + " Expected: " + ChannelType[ChoicesToType[key]] });
            return;
        }

        channelMap.set(key, channel as GuildBasedChannel); // Checked on the if statement on top.
        database.execute("INSERT INTO `channels`(`key`, `id`) VALUES(?, ?) ON DUPLICATE KEY UPDATE `id` = ?", [
            key,
            channel.id,
            channel.id
        ])

    });

    CommandManager.registerCommand("ticket-category", "Creates ticket category (You can use existing channel)", [
        {
            name: "name",
            description: "The category name",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "category",
            description: "The category",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channel_types: [4]
        }
    ], false, undefined, undefined, ticketsAdmin, async (interaction) => {
        if (interaction.guild == undefined) {
            return;
        };

        const name = interaction.options.getString("name", true);
        let channel = interaction.options.getChannel("category", false, [ChannelType.GuildCategory]);

        await interaction.deferReply({ flags: ephemeralFlag(ticketsAdmin.responesEphemeral) });

        if (channel == null) {
            channel = await interaction.guild.channels.create({
                name,
                type: ChannelType.GuildCategory
            }).then((channel) => {
                return channel;
            }).catch((err) => {
                return null;
            })
        }

        database.execute<ResultSetHeader>("INSERT INTO `ticket_categories`(`channel`, `name`) VALUES(?, ?)", [
            channel?.id,
            name
        ]).then((result) => {
            TicketManager.addCategory(result[0].insertId, channel as CategoryChannel, name)
            interaction.editReply({ content: "Done!" })
        })
    });

    CommandManager.registerCommand("ticket-message", "Send ticket's message", [], false, undefined, undefined, ticketsAdmin, async (interaction) => {
        await interaction.deferReply({ flags: ephemeralFlag(ticketsAdmin.responesEphemeral) });

        if (interaction.channel == null || !interaction.channel?.isSendable()) {
            return;
        }

        interaction.channel.send({
            embeds:
                [
                    ticketsAdmin.embedStates.message
                ],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        custom_id: "ticket_categories",
                        label: ticketsAdmin.button.text,
                        style: ticketsAdmin.button.style,
                    }
                ],
            }]
        }).then((res) => {
            interaction.editReply({ content: "Done!" });
        }).catch(() => {
            interaction.editReply({ content: "Failed to send message" })
        })

    });

    CommandManager.registerCommand("ticket-permission", "Set's permission to ticket category", [
        {
            name: "type",
            description: "Add or remove the permission",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Add",
                    value: "add"
                },
                {
                    name: "Remove",
                    value: "remove"
                }
            ]
        },
        {
            name: "role",
            description: "Role",
            type: ApplicationCommandOptionType.Role,
            required: true
        },
        {
            name: "category",
            description: "Category name",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }
    ], false, undefined, (acInteraction) => {
        const categories = [];
        const values = TicketManager.getCategories().getValues();

        for (let index = 0; index < values.length; index++) {
            categories.push({
                name: values[index].getName(),
                value: values[index].getCategory().id
            })
        }

        acInteraction.respond(categories)
    }, ticketsAdmin, (interaction) => {
        const option = interaction.options.getString("type", true);
        const role = interaction.options.getRole("role", true);
        const categoryId = interaction.options.getString("category", true)
        const innerCategory = TicketManager.getCategories().searchValue(categoryId);

        if (!innerCategory) {
            interaction.reply({ content: "Something went wrong 1", flags: "Ephemeral" });
            return;
        }

        if (role.id == (interaction.guild?.roles.everyone ?? "")) {
            interaction.reply({ content: "Something went wrong 2", flags: "Ephemeral" });
            return;
        }

        const roles = innerCategory.getRoles();

        if (option == "add") {
            if (roles.includes(role.id)) {
                interaction.reply({ content: "This role already have the permission to see this category type.", flags: "Ephemeral" });
                return;
            }

            roles.push(role.id);
            database.execute("INSERT INTO `ticket_categories_permissions`(`category`, `role`) VALUES(?, ?)", [
                innerCategory.getId(),
                role.id
            ])
        } else {
            if (!roles.includes(role.id)) {
                interaction.reply({ content: "This role already don't have the permission to see this category type.", flags: "Ephemeral" });
                return;
            }

            roles.splice(roles.indexOf(role.id), 1);
            database.execute("DELETE FROM `ticket_categories_permissions` WHERE `role` = ? AND `category` = ?", [
                role.id,
                innerCategory.getId()
            ])
        }

        interaction.reply({ content: "Done!", flags: "Ephemeral" });
    })

    CommandManager.registerCommand("ticket-permission-view", "A method to view all the roles by categories permissions", undefined, false, undefined, undefined, ticketsAdmin, (interaction) => {
        if (!(interaction.member instanceof GuildMember)) {
            interaction.reply({ content: mainMessages.general_error, flags: ephemeralFlag(ticketsAdmin.responesEphemeral) });
            return;
        }

        const categories = TicketManager.getCategories().getValues();
        
        let text = "";

        for(let index = 0; index < categories.length; index++) {
            const category = categories[index];
            const roles = category.getRoles();
            let rolesText = "";

            if(roles.length == 0) {
                rolesText = "No roles are allowed.";
            } else {
                for(let jail = 0; jail < roles.length; jail++) {
                    rolesText += "<@&" + roles[jail] + "> ";
                }
            }

            text += `${category.getName()}:\\n${rolesText}\\n\\n`;
        }

        
        const embed = placeholderText(interaction.member, ticketsAdmin.embedStates["view-permission"], {
            ticketPermission: text 
        })

        interaction.reply({embeds: [embed], flags: ephemeralFlag(ticketsAdmin.responesEphemeral)});
    
    });
}

export default RegisterCommands;