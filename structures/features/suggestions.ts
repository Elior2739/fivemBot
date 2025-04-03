import database from "../database";
import type { Message, User } from "discord.js";
import messages from "../../config/messages.json"
import { suggest as suggestionData } from "../../config/commands.json"
import type { Suggesters, SuggestionSQLResult, SuggestersSQLResult } from "../../types";
import { placeholderText } from "../../interactions/main";

enum AdminResult {
    Approved = 1,
    Denied = 2
}

enum SuggestionFeedback {
    Upvote = 1,
    Downvote = 2
}

const handleError = () => {
    return messages["general_error"];
}

class Suggestion {

    private id: number;
    private author: string;
    private text: string;
    private admin: null | string;
    private adminResult: null | AdminResult;

    private suggesters: Suggesters = {upvote: [], downvote: []};

    constructor(id: number, author: string, text: string, admin: null | string, adminResult: null | AdminResult, suggesters: Suggesters) {
        this.id = id;
        this.author = author;
        this.text = text;
        this.admin = admin;
        this.adminResult = adminResult;
        this.suggesters = suggesters;
    }

    private updateMessage(message: Message) {
        placeholderText(message.member, suggestionData.embedStates.suggestion, {
            suggestionId: this.id,
            suggestionText: this.text,
            upvotes: this.suggesters.upvote.length,
            downvotes: this.suggesters.downvote.length
        }, (newEmbed) => {
            message.edit({embeds: [newEmbed]})
        })
    }

    async setFeedback(userId: string, message: Message, feedback: SuggestionFeedback) {
        const checks = (feedback == SuggestionFeedback.Downvote ? [this.suggesters.downvote, this.suggesters.upvote] : [this.suggesters.upvote, this.suggesters.downvote])
        
        if(checks[0].includes(userId)) {
            return messages["suggestion_already"];
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
            return messages["suggestion_success"] + "a";
        }

        await database.execute("INSERT INTO `suggesters`(`suggestion`, `user_id`, `type`) VALUES(?, ?, ?)", [
            this.id,
            userId,
            feedback
        ]).catch(handleError)

        checks[0].push(userId);
        this.updateMessage(message);
        return messages["suggestion_success"];
    }

}

const fetchSuggestions = async () => {
    const result = (await database.query<SuggestionSQLResult[]>("SELECT `id`, `author`, `text`, `message`, `admin`, `adminResult` FROM `suggestions`"))[0];

    for(let index = 0; index < result.length; index++) {
        const suggestion = result[index];
        
        database.query<SuggestersSQLResult[]>("SELECT `user_id`, `type` FROM `suggesters` WHERE `suggestion` = ?", [
            suggestion.id
        ]).then((result) => {
            const data = result[0];

            const upvote: string[] = [];
            const downvote: string[] = [];

            for(let i = 0; i < data.length; i++) {
                if(data[i].type == SuggestionFeedback.Upvote) {
                    upvote.push(data[i].user_id)
                    continue;
                };

                downvote.push(data[i].user_id)

            }
            
            suggestions.set(suggestion.message, new Suggestion(
                suggestion.id,
                suggestion.author,
                suggestion.text,
                suggestion.admin,
                suggestion.adminResult,
                {upvote, downvote}
            ))
        })
    }
}

const suggestions = new Map<string, Suggestion>()

export default suggestions
export {
    fetchSuggestions,
    SuggestionFeedback
}