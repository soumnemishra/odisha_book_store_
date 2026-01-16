import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const smokeTest = async () => {
    const client = new MongoClient(process.env.MONGO_URI || process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('books');

        console.log('═'.repeat(60));
        console.log('📊 SMOKE TEST RESULTS');
        console.log('═'.repeat(60));

        // Test 1: Find an English book
        console.log('\n1️⃣  English Book Test:');
        const englishBook = await collection.findOne({ 'title.english': { $exists: true } });
        if (englishBook) {
            console.log(`✅ Found English book: "${englishBook.title.display}"`);
            console.log(`   Language: ${englishBook.language}`);
            console.log(`   Title structure: ${JSON.stringify(englishBook.title)}`);
            console.log(`   Price structure: ${JSON.stringify(englishBook.price)}`);
        } else {
            console.log('❌ No English books found!');
        }

        // Test 2: Find an Odia book
        console.log('\n2️⃣  Odia Book Test:');
        const odiaBook = await collection.findOne({ 'title.odia': { $exists: true } });
        if (odiaBook) {
            console.log(`✅ Found Odia book: "${odiaBook.title.display}"`);
            console.log(`   Language: ${odiaBook.language}`);
            console.log(`   Title structure: ${JSON.stringify(odiaBook.title)}`);
            console.log(`   Price structure: ${JSON.stringify(odiaBook.price)}`);
        } else {
            console.log('❌ No Odia books found!');
        }

        // Test 3: Count migrated books
        console.log('\n3️⃣  Migration Statistics:');
        const totalBooks = await collection.countDocuments({});
        const migratedBooks = await collection.countDocuments({ 'title.display': { $exists: true } });
        const odiaBooks = await collection.countDocuments({ language: 'Odia' });
        const englishBooks = await collection.countDocuments({ language: 'English' });

        console.log(`   Total books: ${totalBooks}`);
        console.log(`   Migrated books: ${migratedBooks}`);
        console.log(`   Odia books: ${odiaBooks}`);
        console.log(`   English books: ${englishBooks}`);

        console.log('\n═'.repeat(60));

        if (migratedBooks === totalBooks) {
            console.log('✅ ALL BOOKS SUCCESSFULLY MIGRATED!');
        } else {
            console.log(`⚠️  ${totalBooks - migratedBooks} books not yet migrated`);
        }

        console.log('═'.repeat(60));

    } catch (error) {
        console.error('❌ Smoke test error:', error.message);
    } finally {
        await client.close();
    }
};

smokeTest();
