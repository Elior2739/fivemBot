import type { ApplicationCommandOption, CommandInteraction, PermissionFlags, PermissionResolvable, PermissionsBitField } from "discord.js";

interface Command {
    description: string,
    options?: ApplicationCommandOptionData[],
    default_member_permissions?: PermissionResolvable,

    onInteract: (interaction: CommandInteraction) => void
}


interface FormatData {
    serverName: string,
    serverAddress: string,
    serverCfxAddress: string,
    serverOnline: boolean
}

interface FormatDataOnline extends FormatData, ServerInfoData {}

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

export {
    Command,
    FormatData,
    JsonEmbed,
    ServerInfo,
    ServerInfoData,
    FormatDataOnline
}