import { Events } from "discord.js";
import client from "../structures/client";
import { Debug, Log } from "../structures/logger";

import { handler as messageCreateHandler } from "./messageCreate"; 

const discordjsEvents: string[] = Object.values(Events);

const events = [
    {
        event: "messageCreate",
        handler: messageCreateHandler
    }
]

const eventExist = (eventName: string) => discordjsEvents.includes(eventName);

const RegisterEvents = () => {
    let eventsRegistered = 0;

    for(let i = 0; i < events.length; i++) {
        const eventData = events[i];

        if(eventExist(eventData.event)) {
            client.on(eventData.event, eventData.handler);
            Debug("info", "events/main", "registerEvents", "Event (" + eventData.event +") has been Registered");
            eventsRegistered++;
            continue;
        }

        Debug("warn", "events/main", "registerEvents", "Event not exists or typed wrong, Event name: " + eventData.event);
    }

    Log("info", eventsRegistered + " Event(s) registered.");
};

export default RegisterEvents;