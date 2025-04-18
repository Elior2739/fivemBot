
import RegisterEvents from "./events/main";
import { handleInteraction } from "./interactions/main";
import { fetchChannels } from "./structures/channelManager";
import client from "./structures/client";
import { Debug, Log } from "./structures/logger";
import { startServerListener } from "./structures/serverListener";
import RegisterCommands from "./interactions/commands";
import SuggestionManager from "./structures/features/Suggestions/SuggestionManager";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

client.once("ready", (client) => {
    Log("info", "The client is ready as " + client.user.displayName)
    Debug("info", "index.ts", "event - ready", "Client is connected as " + client.user.displayName + "\nIntents: " + client.options.intents.toArray().join(", "));

    client.on("interactionCreate", handleInteraction);

    RegisterEvents();
    RegisterCommands();

    startServerListener()
    fetchChannels();
    SuggestionManager.fetchSuggestions();
})