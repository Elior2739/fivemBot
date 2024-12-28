import type { ServerInfo } from "../../types";

declare var self: Worker;

let cfxId: string | null = null;

const fetchServerInfo = async () => {
    const serverData = await fetch("https://servers-frontend.fivem.net/api/servers/single/" + cfxId).then(async (response) => {
        if(response.status != 200) {
            return null;
        }

        return await response.json();
    }) as null | ServerInfo;

    self.postMessage({type: "recieveData", data: serverData});
}

self.addEventListener("message", async (event) => {
    if(event.data.type == "start") {
        cfxId = event.data.data;
        fetchServerInfo();
        setInterval(fetchServerInfo, 60000);
    }
});