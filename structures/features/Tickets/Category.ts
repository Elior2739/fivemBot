import type { CategoryChannel } from "discord.js";


interface CategoryPermissions {
    role: string;
    permissions: bigint;
}

export default class Category {

    private id: number;
    private name: string;
    private category: CategoryChannel;
    private roles: string[]; 

    constructor(id: number, name: string, category: CategoryChannel, roles: string[]) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.roles = roles;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getCategory() {
        return this.category;
    }

    getRoles() {
        return this.roles;
    }



}