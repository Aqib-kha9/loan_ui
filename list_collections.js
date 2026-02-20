
const { MongoClient } = require('mongodb');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

async function run() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('test');
        const collections = await db.listCollections().toArray();
        console.log("Collections in 'test' database:");
        collections.forEach(c => console.log(` - ${c.name}`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        process.exit(0);
    }
}
run();
