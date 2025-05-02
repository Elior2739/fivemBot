import database from "../../database";
import type { Message } from "discord.js";
import messages from "../../../config/messages.json"
import suggestionData from "../../../config/features/suggestion.json"
import type { Suggesters } from "../../../types";
import { placeholderText } from "../../../utils";
import { AdminResult, SuggestionFeedback } from "./SuggestionManager";



const handleError = () => {
    return messages["general_error"];
}

class Suggestion {

    private id: number;
    private author: string;
    private text: string;
    private message: string;
    private admin: null | string;
    private adminResult: null | AdminResult;

    private suggesters: Suggesters = {upvote: [], downvote: []};

    constructor(id: number, author: string, text: string, message: string, admin: null | string, adminResult: null | AdminResult, suggesters: Suggesters) {
        this.id = id;
        this.author = author;
        this.text = text;
        this.message = message;
        this.admin = admin;
        this.adminResult = adminResult;
        this.suggesters = suggesters;
    }

    private updateMessage(message: Message) {
        const newEmbed = placeholderText(message.member, suggestionData.embedStates.suggestion, {
            suggestionId: this.id,
            suggestionText: this.text,
            upvotes: this.suggesters.upvote.length,
            downvotes: this.suggesters.downvote.length
        });

        message.edit({embeds: [newEmbed]});
    }

    async setFeedback(userId: string, message: Message, feedback: SuggestionFeedback) {
        if(this.author == userId && !suggestionData.settings.can_self_vote) {
            return suggestionData.messages["self_vote"]
        }

        const checks = (feedback == SuggestionFeedback.Downvote ? [this.suggesters.downvote, this.suggesters.upvote] : [this.suggesters.upvote, this.suggesters.downvote])
        
        if(checks[0].includes(userId)) {
            return suggestionData.messages["duplicate_feedback"];
        }

        if(checks[1].includes(userId)) {
            checks[1].splice(checks[1].indexOf(userId), 1)
            checks[0].push(userId);

            await database.execute("UPDATE `suggesters` SET `type` = ? WHERE `suggestion` = ? AND `user_id` = ?", [
                feedback,
                this.id,
                userId
            ]).catch(handleError)

            this.updateMessage(message)
            return suggestionData.messages["success"];
        }

        await database.execute("INSERT INTO `suggesters`(`suggestion`, `user_id`, `type`) VALUES(?, ?, ?)", [
            this.id,
            userId,
            feedback
        ]).catch(handleError)

        checks[0].push(userId);
        this.updateMessage(message);
        return suggestionData.messages["success"];
    }

    addUpvote(userId: string) {
        this.suggesters.upvote.push(userId);
    }

    addDownvote(userId: string) {
        this.suggesters.downvote.push(userId);
    }

    getId() {
        return this.id;
    }

    getAuthor() {
        return this.author;
    }

    getText() {
        return this.text;
    }

    getMessage() {
        return this.message;
    }

    getAdmin() {
        return this.admin;
    }

    getAdminResult() {
        return this.adminResult;
    }

    getSuggesters() {
        return this.suggesters;
    }

}

export default Suggestion;