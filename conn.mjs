import {MongoClient} from "mongodb";

const uri="mongodb://localhost"
const client=new MongoClient(uri)

try {
    await client.connect();
}catch (e) {
    console.error(e)
}

const db=client.db("worldwise");
export default db;