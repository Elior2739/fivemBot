import database from "../../database";
import type Category from "./Category";
import type { TicketState } from "./TicketManager";



export default class {

    private id;
    private category;
    private author;
    private channel;
    private state;

    constructor(id: number, cateogry: Category, author: string, channel: string, state: TicketState) {
        this.id = id;
        this.category = cateogry;
        this.author = author;
        this.channel = channel;
        this.state = state;
    }

    getId() {
        return this.id;
    }

    getCategory() {
        return this.category;
    }

    getAuthor() {
        return this.author;
    }

    getChannel() {
        return this.channel;
    }

    getState() {
        return this.state;
    }

    async setState(newState: TicketState) {
        return await database.execute("UPDATE `tickets` SET `state` = ? WHERE `id` = ?", [
            newState,
            this.getId()
        ]).then(() => {
            return true;
        }).catch(() => {
            return false;
        })
    }
}