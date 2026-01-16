// scripts/rebuild-indexes.js
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

/**
 * Rebuild indexes after schema migration
 * This script drops old indexes and creates new ones for the nested structure
 */
const rebuildIndexes = async () => {
    let client;

    try {
        // Connect using native MongoDB driver
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
        }

        client = new MongoClient(mongoUri);
        await client.connect();

        const db = client.db();
        const dbName = db.databaseName;

        console.log(`✓ Connected to DB: ${dbName}\n`);

        const collection = db.collection('books');

        // Get existing indexes
        const existingIndexes = await collection.listIndexes().toArray();
        console.log('📋 Current indexes:');
        existingIndexes.forEach((idx) => {
            console.log(`   - ${idx.name}`);
        });
        console.log('');

        // Drop old text index on 'title' field if it exists
        try {
            console.log('🗑️  Attempting to drop old "title_text" index...');
            await collection.dropIndex('title_text');
            console.log('✅ Dropped title_text index');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('ℹ️  No title_text index found (already dropped or never existed)');
            } else {
                console.warn(`⚠️  Could not drop title_text: ${err.message}`);
            }
        }

        // Drop old index on plain 'title' field if it exists
        try {
            console.log('🗑️  Attempting to drop old "title_1" index...');
            await collection.dropIndex('title_1');
            console.log('✅ Dropped title_1 index');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('ℹ️  No title_1 index found');
            } else {
                console.warn(`⚠️  Could not drop title_1: ${err.message}`);
            }
        }

        console.log('\n🔨 Creating new indexes for nested structure...\n');

        // Create text index on title.display for full-text search (NO language_override!)
        console.log('📝 Creating text index on title.display...');
        await collection.createIndex(
            { 'title.display': 'text', description: 'text', author: 'text' },
            { name: 'title_display_text' }
        );
        console.log('✅ Created title_display_text index');

        // Create separate indexes on title.english and title.odia for better query performance
        console.log('📝 Creating index on title.english...');
        await collection.createIndex({ 'title.english': 1 }, { name: 'title_english_1', sparse: true });
        console.log('✅ Created title_english_1 index');

        console.log('📝 Creating index on title.odia...');
        await collection.createIndex({ 'title.odia': 1 }, { name: 'title_odia_1', sparse: true });
        console.log('✅ Created title_odia_1 index');

        // Create index on tags for array queries
        console.log('📝 Creating index on tags...');
        await collection.createIndex({ tags: 1 }, { name: 'tags_1', sparse: true });
        console.log('✅ Created tags_1 index');

        // Create index on language field for filtering (safe now without language_override)
        console.log('📝 Creating index on language...');
        await collection.createIndex({ language: 1 }, { name: 'language_1' });
        console.log('✅ Created language_1 index');

        // Create compound index for price queries
        console.log('📝 Creating index on price.discounted...');
        await collection.createIndex({ 'price.discounted': 1 }, { name: 'price_discounted_1' });
        console.log('✅ Created price_discounted_1 index');

        // Get updated indexes
        const newIndexes = await collection.listIndexes().toArray();
        console.log('\n📋 Updated indexes:');
        newIndexes.forEach((idx) => {
            console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n✅ Index rebuild complete!');
    } catch (error) {
        console.error('\n💥 INDEX REBUILD ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Disconnected from database');
        }
    }
};

// Execute index rebuild
rebuildIndexes();
