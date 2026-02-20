
const { MongoClient } = require('mongodb');
const MONGODB_URI = "mongodb+srv://aqib:aqib@cluster0.rwwbcqt.mongodb.net/";

async function run() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        console.log("Databases on this cluster:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        process.exit(0);
    }
}
run();
