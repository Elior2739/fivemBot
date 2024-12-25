
import registerEvents from "./events/main";
import { handleInteraction } from "./interactions/main";
import client from "./structures/client";
import { Debug, Log } from "./structures/logger";
import { startServerListener } from "./structures/serverListener";

client.once("ready", (client) => {
    Log("info", "The client is ready as " + client.user.displayName)
    Debug("info", "index.ts", "event - ready", "Client is connected as " + client.user.displayName + "\nIntents: " + client.options.intents.toArray().join(", "));

    client.on("interactionCreate", handleInteraction);
    registerEvents();
    startServerListener()
})