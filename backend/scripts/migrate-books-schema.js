// scripts/migrate-books-schema.js
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import fs from 'fs';

dotenv.config();

// Unicode range for Odia Characters (U+0B00 to U+0B7F)
const ODIA_CHAR_REGEX = /[\u0B00-\u0B7F]/;

/**
 * Detect if a string contains Odia characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains Odia characters
 */
const hasOdiaCharacters = (text) => {
    if (!text || typeof text !== 'string') return false;
    return ODIA_CHAR_REGEX.test(text);
};

/**
 * Transform a flat book document to new nested schema
 * @param {Object} doc - Original document
 * @returns {Object} - Transformed update object
 */
const transformDocument = (doc) => {
    const oldTitle = doc.title || 'Untitled';
    const oldPrice = typeof doc.price === 'number' ? doc.price : 0;

    // Language Detection
    const hasOdia = hasOdiaCharacters(oldTitle);
    const language = hasOdia ? 'Odia' : 'English';

    // Construct New Title Structure
    const newTitle = {
        display: oldTitle,
        english: !hasOdia ? oldTitle : undefined,
        odia: hasOdia ? oldTitle : undefined,
    };

    // Construct New Price Structure
    const newPrice = {
        original: oldPrice,
        discounted: oldPrice, // Default to same price
        discountPercent: 0,
    };

    return {
        title: newTitle,
        price: newPrice,
        language,
        academicGrade: null,
        tags: [],
    };
};

/**
 * Main migration function
 */
const migrate = async () => {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');

    let client;

    try {
        // Connect using native MongoDB driver (bypass Mongoose schema)
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
        }

        client = new MongoClient(mongoUri);
        await client.connect();

        const db = client.db();
        const dbName = db.databaseName;

        console.log(`✓ Connected to DB: ${dbName}`);
        console.log(`✓ Mode: ${isDryRun ? '🔍 DRY RUN (Preview Only)' : '🚀 LIVE MIGRATION'}`);
        console.log('─'.repeat(60));

        const collection = db.collection('books');
        const totalDocs = await collection.countDocuments({});
        console.log(`📚 Total documents in collection: ${totalDocs}\n`);

        // Use cursor for memory-efficient processing
        const cursor = collection.find({});

        let processed = 0;
        let skipped = 0;
        let errors = 0;
        const errorDocs = [];

        console.log('Starting migration...\n');

        while (await cursor.hasNext()) {
            const doc = await cursor.next();

            try {
                // Idempotency Check: Skip if already migrated
                if (typeof doc.title === 'object' && doc.title.display) {
                    skipped++;
                    if (isDryRun && skipped <= 2) {
                        console.log(`⏭️  [SKIP] "${doc.title.display}" - Already migrated`);
                    }
                    continue;
                }

                // Ensure we have a valid title field to migrate
                if (!doc.title || typeof doc.title !== 'string') {
                    console.warn(`⚠️  [WARN] Doc ${doc._id} has invalid title field, skipping`);
                    skipped++;
                    continue;
                }

                // Transform the document
                const updates = transformDocument(doc);

                // Preview in dry-run mode
                if (isDryRun) {
                    if (processed < 5) {
                        console.log(`\n📖 [PREVIEW] Document: ${doc._id}`);
                        console.log(`   Old Title: "${doc.title}"`);
                        console.log(`   New Title: ${JSON.stringify(updates.title, null, 2)}`);
                        console.log(`   Language: ${updates.language}`);
                        console.log(`   Old Price: ${doc.price}`);
                        console.log(`   New Price: ${JSON.stringify(updates.price, null, 2)}`);
                    }
                    processed++;
                    continue;
                }

                // Execute the update - use replaceOne with spread to preserve all fields
                const newDoc = {
                    ...doc, // Preserve all existing fields
                    ...updates, // Override with new nested structure
                };

                // Remove the _id from the newDoc to avoid "Mod on _id not allowed" error
                delete newDoc._id;

                await collection.replaceOne(
                    { _id: doc._id },
                    newDoc
                );


                processed++;

                // Progress indicator
                if (processed % 10 === 0) {
                    process.stdout.write('.');
                }
                if (processed % 100 === 0) {
                    console.log(` ${processed}/${totalDocs}`);
                }
            } catch (err) {
                errors++;
                const errorInfo = {
                    id: doc._id,
                    title: doc.title,
                    error: err.message,
                };
                errorDocs.push(errorInfo);
                console.error(`\n❌ [ERROR] Failed to update doc ${doc._id}: ${err.message}`);
            }
        }

        // Final Summary
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Successfully processed: ${processed}`);
        console.log(`⏭️  Skipped (already migrated): ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`📚 Total documents: ${totalDocs}`);
        console.log('═'.repeat(60));

        if (isDryRun) {
            console.log('\n🔍 DRY RUN COMPLETE - No changes were made to the database');
            console.log('   Run without --dry-run flag to execute migration');
        } else {
            console.log('\n✅ MIGRATION COMPLETE!');
            console.log('\n⚠️  IMPORTANT NEXT STEPS:');
            console.log('   1. Rebuild text indexes: npm run migrate:books:rebuild-indexes');
            console.log('   2. Verify data: Check a few documents manually');
            console.log('   3. Test API endpoints: Ensure frontend works correctly');
            console.log('   4. Update frontend code to use nested title/price fields');
        }

        if (errors > 0) {
            console.log('\n❌ FAILED DOCUMENTS:');
            errorDocs.forEach((err) => {
                console.log(`   ID: ${err.id}, Title: "${err.title}", Error: ${err.error}`);
            });

            // Log to file since logger might not be available
            const logFile = 'migration-errors.json';
            fs.writeFileSync(logFile, JSON.stringify(errorDocs, null, 2));
            console.log(`\n📝 Error details written to: ${logFile}`);
        }
    } catch (error) {
        console.error('\n💥 MIGRATION FATAL ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Disconnected from database');
        }
    }
};

// Execute migration
migrate();
