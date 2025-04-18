import database, { query } from "../../database";
import type { Suggesters, SuggestionSQLResult, SuggestersSQLResult } from "../../../types";
import Suggestion from "./Suggestion";
import MultipleKeyValue from "../../MultipleKeyValue";

enum AdminResult {
    Approved = 1,
    Denied = 2
}

enum SuggestionFeedback {
    Upvote = 1,
    Downvote = 2
}

export default new class {

    private suggestions = new MultipleKeyValue<Suggestion>();

    constructor() {}

    async fetchSuggestions() {

        const suggestionsRaw = await query<SuggestionSQLResult>("SELECT `id`, `author`, `text`, `message`, `admin`, `adminResult`, `user_id`, `type`  FROM `suggestions` LEFT JOIN `suggesters` ON `suggesters`.`suggestion` = `suggestions`.`id`", []);
        if(suggestionsRaw == undefined) return;

        for(let index = 0; index < suggestionsRaw.length; index++) {
            const rawSuggestion = suggestionsRaw[index];
            const suggestionVal = this.suggestions.searchValue(rawSuggestion.message);

            if(suggestionVal != null && rawSuggestion.user_id != undefined && rawSuggestion.type != undefined) {
                if(rawSuggestion.type == SuggestionFeedback.Upvote) {
                    suggestionVal.addUpvote(rawSuggestion.user_id)
                    continue;
                }

                suggestionVal.addDownvote(rawSuggestion.user_id);
                continue;
            }

            const upvotes = [];
            const downvotes = [];

            if(rawSuggestion.user_id != undefined && rawSuggestion.type != undefined) {
                if(rawSuggestion.type == SuggestionFeedback.Upvote) {
                    upvotes.push(rawSuggestion.user_id)
                } else {
                    downvotes.push(rawSuggestion.user_id);
                }

            }

            const suggestion = new Suggestion(
                rawSuggestion.id,
                rawSuggestion.author,
                rawSuggestion.text,
                rawSuggestion.message,
                rawSuggestion.admin,
                rawSuggestion.adminResult,
                {
                    upvote: upvotes,
                    downvote: downvotes
                }
            )

            this.suggestions.set([rawSuggestion.id, rawSuggestion.message], suggestion);
        } 
    }

    addSuggestion(id: number, author: string, text: string, message: string, admin: null | string, adminResult: null | AdminResult, suggesters: Suggesters) {
        const suggestion = new Suggestion(
            id,
            author,
            text,
            message,
            admin,
            adminResult,
            suggesters
        )

        this.suggestions.set([id, message], suggestion)
    }

    searchSuggestion(messageId: string | number): Suggestion | undefined {
        return this.suggestions.searchValue(messageId);
    }
}

export {
    AdminResult,
    SuggestionFeedback
}