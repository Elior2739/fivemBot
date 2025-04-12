import type { ApplicationCommandOption, Base, CommandInteraction, PermissionFlags, PermissionResolvable, PermissionsBitField } from "discord.js";
import type { RowDataPacket } from "mysql2";

interface CommandData {
    responesEphemeral: boolean;

    cooldown: {
        enabled: boolean;
        time: number;
    };

    permission: {
        type: string | "role" | "permission";
        value: string;

        administratorBypass: boolean;
    }

    modal?: {
        modalTitle: string;
        modalInputLabel: string;
    }

    buttons?: Record<string, {
        text: string;
        style: number
    }>

    embedStates?: Record<string, JsonEmbed>
}

interface Command {
    description: string;
    options?: ApplicationCommandOptionData[];
    default_member_permissions?: string;
    commandData?: CommandData;
    cooldowns?: [];

    onInteract: (interaction: CommandInteraction) => void
}

interface JsonEmbed {
    "title"?: string,
    "description"?: string,
    "color"?: number
}

interface ServerInfoData {
    clients: number,
    gametype: string,
    hostname: string,
    mapname: string,
    sv_maxclients: number,
    enhancedHostSupport: boolean,
    requestSteamTicket: string,
    resources?: string[],
    server: string,
    vars?: {
        banner_connecting: string,
        banner_detail: string,
        gamename: string,
        locale: string,
        onesync_enabled: string,
        sv_disableClientReplays: string,
        sv_enforceGameBuild: string,
        sv_enhancedHostSupport: string,
        sv_lan: string,
        sv_licenseKeyToken: string,
        sv_maxClients: string,
        sv_poolSizesIncrease: string,
        sv_projectDesc: string,
        sv_projectName: string,
        sv_pureLevel: string,
        sv_scriptHookAllowed: string,
        tags: string,
        premium: string,
    },
    selfReportedClients: number,
    players?: {
        endpoint: string,
        id: number,
        identifiers: string[],
        name: string,
        ping: number
    }[],
    ownerID: number,
    private: boolean,
    fallback: boolean,
    connectEndPoints: string[],
    upvotePower: number,
    burstPower: number,
    support_status: string,
    svMaxclients: number,
    ownerName: string,
    ownerProfile: string,
    suspendedTill: string,
    ownerAvatar: string,
    lastSeen: string,
    iconVersion: number
}

interface ServerInfo {
    EndPoint: string,
    Data: ServerInfoData
}

interface BasePlaceholders {
    serverOnline: boolean;
    serverOnline_S: string;
    serverName: string,
    serverCfxAddress: string,
}

interface ServerPlaceholders extends BasePlaceholders {
    currentPlayers: number;
    currentPlayers_S: string;
    maxPlayers: number;
    maxPlayers_S: string;

    upvotePower: number;
    upvotePower_S: string; 
    burstPower: number;
    burstPower_S: string;

    ownerId: number;
    ownerName: string;
    ownerProfile: string;
    ownerAvatar: string;
}

interface InteractionPlaceholders extends BasePlaceholders {
    userTag: string;
    userId: string;
    userName: string;
    memberName: string;
}

interface SuggestionPlaceholders {
    suggestionId: number;
    suggestionText: string;
    upvotes: number;
    downvotes: number;
}

type ExtraPlaceHolders = SuggestionPlaceholder;

interface SuggestionSQLResult extends RowDataPacket {
    id: number;
    author: string;
    text: string;
    message: string;
    admin: null | string;
    adminResult: null | AdminResult;
}

interface SuggestersSQLResult extends RowDataPacket {
    user_id: string;
    type: SuggestionFeedback
}

interface Suggesters {
    upvote: string[],
    downvote: string[]
}

export {
    Command,
    JsonEmbed,
    ServerInfo,
    ServerInfoData,

    BasePlaceholders,
    ServerPlaceholders,
    InteractionPlaceholders,
    SuggestionPlaceholders,
    ExtraPlaceHolders,
    
    SuggestionSQLResult,
    SuggestersSQLResult,
    Suggesters,

    CommandData
}