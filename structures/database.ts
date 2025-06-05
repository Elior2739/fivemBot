import { createPool, type RowDataPacket } from "mysql2/promise"

const database = createPool(process.env.CONNECTION_URI || "");

database.getConnection().catch((error) => {
    console.log(error)
})

const query = async <T extends RowDataPacket>(sql: string, params: any) => {
    return await database.query<T[]>(sql, params).then((result) => {
        return result[0];
    }).catch((error) => {
        console.log(error)
        return undefined;
    })
}

export default database;
export {
    query
}