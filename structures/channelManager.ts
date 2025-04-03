import type { RowDataPacket } from "mysql2";
import database from "./database"
import type { Channel } from "discord.js";
import client from "./client";

interface SQLChannelsResult extends RowDataPacket {
    "key": string,
    "id": string;
}

const channelMap = new Map<String, Channel>();

const fetchChannels = async () => {
    const [ rows ] = await database.query<SQLChannelsResult[]>("SELECT `key`, `id` FROM `channels`")

    for(let index = 0; index < rows.length; index++) {
        const { key, id } = rows[index];

        client.channels.fetch(id).then((channel) => {
            channel != null && channelMap.set(key, channel);
        });
    }
}

export default channelMap;
export { fetchChannels};