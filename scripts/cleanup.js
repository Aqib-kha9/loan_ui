const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/loanerp';

async function cleanup() {
    console.log('--- Database Cleanup Started ---');
    console.log('Connecting to MongoDB...');
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // Define models to wipe
        // We use the collection names directly via mongoose connection to avoid schema complexity
        const collectionsToWipe = ['loans', 'clients', 'activities'];
        
        for (const colName of collectionsToWipe) {
            const collection = mongoose.connection.collection(colName);
            const count = await collection.countDocuments();
            console.log(`Wiping ${colName}... (${count} documents)`);
            await collection.deleteMany({});
            console.log(`Successfully cleared ${colName}.`);
        }

        console.log('\n--- Status Check ---');
        console.log('Preserved: Users, Roles, Settings.');
        console.log('Cleared: Loans, Clients, Activity History.');
        console.log('\nDatabase is now fresh for production use.');

    } catch (error) {
        console.error('Cleanup Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

cleanup();
