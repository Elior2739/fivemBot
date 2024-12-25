import info from "../config/info.json"
import type { FormatData, FormatDataOnline, ServerInfo } from "../types";
import { Log } from "./logger"

const serverStatusWorker = new Worker("./structures/workers/serverStatusWorker.ts");
const linkCheck = ['https:', '', 'cfx.re', 'join'];

let serverInfoNormal: ServerInfo | null = null;
let serverFormatted: FormatData | FormatDataOnline = {
    serverName: "Loading...",
    serverAddress: "Loading...",
    serverCfxAddress: "Loading...",
    clients: 0,
    serverOnline: false
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


const formatData = (serverInfo: ServerInfo | null) => { // Freaking type things. I hate typescript. TODO: Find a fucking fuck better way to do it
    serverInfoNormal = serverInfo
    
    if (serverInfo != null) {
        const resultObj = {
            ...info,
            serverOnline: true
        } as FormatDataOnline

        const serverInfoKeys = Object.keys(serverInfo.Data) as (keyof FormatDataOnline)[];
        for (let index = 0; index < serverInfoKeys.length; index++) {
            const key = serverInfoKeys[index];

            if (key == "resources") {
                // TODO: Do it
                continue;
            } else if (key == "vars") {
                // TODO: Do it
                continue;
            } else if (key == "players") {
                // TODO: Do it
                continue;
            } else if (key == "connectEndPoints") {
                // TODO: Ignore it?
                continue;
            }

            // @ts-ignore
            resultObj[key] = serverInfo.Data[key];
        }

        serverFormatted = resultObj;
        return
    }

    const resultObj = {
        ...info,
        playersAmount: 0,
        serverOnline: true
    } as FormatData

    serverFormatted = resultObj;
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