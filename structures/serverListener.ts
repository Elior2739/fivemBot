import info from "../config/info.json"
import type { BasePlaceholders, ServerInfo, ServerPlaceholders } from "../types";
import { Log } from "./logger"

const serverStatusWorker = new Worker("./structures/workers/serverStatusWorker.ts");
const linkCheck = ['https:', '', 'cfx.re', 'join'];

let serverInfoNormal: ServerInfo | null = null;
let serverFormatted: BasePlaceholders | ServerPlaceholders = {
    serverName: "Loading...",
    serverCfxAddress: "Loading...",
    currentPlayers: 0,
    serverOnline: false,
    serverOnline_S: "No"
};

const getCfxId = (address: string) => {
    const addressSplitted = address.split("/");

    if (addressSplitted.length - 1 != linkCheck.length) {
        return null;
    }

    for (let index = 0; index < linkCheck.length; index++) {
        if (linkCheck[index] != addressSplitted[index]) {
            return null;
        }
    }

    return addressSplitted[4];
}

const translate = {
    currentPlayers: {
        zero: "No Players",
        one: "1 Player",
        beyond: "Players"
    },
    maxPlayers: {
        zero: "No one is allowed to join",
        one: "1 Player Allowed",
        beyond: "Max"
    },
    power: {
        zero: "No Power",
        one: "1 Upvote/Burst",
        beyond: "Upvotes/Bursts"
    }
}

const stringifyPlaceholderNumber = (amount: number, type: "currentPlayers" | "maxPlayers" | "power" ): string => {
    if(amount == 0) {
        return translate[type].zero;
    } else if(amount == 1) {
        return translate[type].one;
    } else {
        return amount + " " + translate[type].beyond
    }
}

const formatData = (serverInfo: ServerInfo | null): void => {
    serverInfoNormal = serverInfo;
    serverFormatted = (serverInfo == null ? { // BasePlaceholders
        ...info,
        serverOnline: false,
        serverOnline_S: "No"
    } as BasePlaceholders : { // ServerPlaceholders
        ...info,
        serverOnline: true,
        serverOnline_S: "Yes",

        currentPlayers: serverInfo.Data.clients,
        currentPlayers_S: stringifyPlaceholderNumber(serverInfo.Data.clients, "currentPlayers"),

        maxPlayers: serverInfo.Data.sv_maxclients,
        maxPlayers_S: stringifyPlaceholderNumber(serverInfo.Data.sv_maxclients, "maxPlayers"),

        upvotePower: serverInfo.Data.upvotePower,
        upvotePower_S: stringifyPlaceholderNumber(serverInfo.Data.upvotePower, "power"),
        burstPower: serverInfo.Data.burstPower,
        burstPower_S: stringifyPlaceholderNumber(serverInfo.Data.burstPower, "power"),
    
        ownerId: serverInfo.Data.ownerID,
        ownerName: serverInfo.Data.ownerName,
        ownerProfile: serverInfo.Data.ownerProfile,
        ownerAvatar: serverInfo.Data.ownerAvatar,
        
    } as ServerPlaceholders)
}

const startServerListener = () => {
    const cfxId = getCfxId(info.serverCfxAddress);

    if (cfxId == null) {
        Log("error", "Invalid cfx address. The address needs to be https://cfx.re/join/XXXXX. Server status & info wouldn't be available");
        return;
    }

    serverStatusWorker.postMessage({ type: "start", data: cfxId });
    serverStatusWorker.addEventListener("message", (event) => {
        if (event.data.type == "recieveData") {
            formatData(event.data.data as ServerInfo | null);
        }
    })
}

const getServerInfoNormal = () => serverInfoNormal;
const getServerInfoFormatted = () => serverFormatted;

export {
    startServerListener,
    getServerInfoNormal,
    getServerInfoFormatted
}