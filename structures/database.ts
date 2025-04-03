import { createPool } from "mysql2/promise"

const database = createPool(process.env.CONNECTION_URI || "");

database.getConnection().catch((error) => {
    console.log(error)
})

export default database;