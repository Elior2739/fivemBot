import type { ModalSubmitInteraction } from "discord.js"
import type { ResultSetHeader } from "mysql2";
import { ChannelType, GuildMember } from "discord.js"

import channelMap from "../../structures/channelManager";
import database from "../../structures/database";

import { placeholderText } from "../../utils";
import { ephemeralFlag } from "../../utils";

import mainMessages from "../../config/messages.json"
import suggestionData from "../../config/features/suggestion.json"
import SuggestionManager from "../../structures/features/Suggestions/SuggestionManager";
import InteractionManager, { InternalInteractionType } from "../../structures/InteractionManager";

const Modals = () => {
    InteractionManager.registerHandler("suggestion", suggestionData, InternalInteractionType.Modal, async (interaction) => {
        if(!(interaction.member instanceof GuildMember)) return;

        await interaction.deferReply({flags: ephemeralFlag(suggestionData.responesEphemeral)})
        const suggestionText = interaction.fields.getTextInputValue("suggestion_text");

        if(suggestionText.length > 256) {
            interaction.editReply({content: mainMessages.general_error});
            return;
        }

        const suggestionChannel = channelMap.get("suggestions");

        if(suggestionChannel == undefined || suggestionChannel.type != ChannelType.GuildText) {
            interaction.editReply({content: mainMessages.general_error});
            return;
        }

        const suggestionInsertId = await  database.execute<ResultSetHeader>("INSERT INTO `suggestions`(`author`, `text`) VALUES(?, ?)", [
            interaction.user.id,
            suggestionText
        ]).then((data) => data[0].insertId).catch((err) => undefined);

        if(suggestionInsertId == undefined) {
            interaction.editReply({content: mainMessages.general_error});
            return;
        }

        const embed = placeholderText(interaction.member as GuildMember,
            suggestionData.embedStates.suggestion,
            {
                suggestionInsertId,
                suggestionText: suggestionText,
                upvotes: 0,
                downvotes: 0
            }
        )

        const message = await suggestionChannel.send({embeds: [embed], components: [{
            type: 1,
            components: [
              {
                type: 2,
                custom_id: "suggestion_upvote",
                label: suggestionData.buttons.upvote.text,
                style: suggestionData.buttons.upvote.style,
              }, {
                type: 2,
                custom_id: "suggestion_downvote",
                label: suggestionData.buttons.downvote.text,
                style: suggestionData.buttons.downvote.style,
              }
            ],
        }]}).then((message) => message).catch(() => undefined);

        if(message == undefined) {
            interaction.editReply({content: mainMessages.general_error});
            return;
        }

        const result = await database.execute("UPDATE `suggestions` SET `message` = ? WHERE `id` = ?", [
            message.id,
            suggestionInsertId
        ]).then((a) => true).catch((err) => false);

        if(!result) {
            interaction.editReply({content: mainMessages.general_error});
            message.delete().catch((err) => err);
            return;
        }

        SuggestionManager.addSuggestion(suggestionInsertId, interaction.user.id, suggestionText, message.id, null, null, {upvote: [], downvote: []})
        interaction.editReply({content: suggestionData.messages["created_succesfully"]});
    })
}

export default Modals;