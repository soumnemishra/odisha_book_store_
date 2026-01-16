// scripts/rollback-books-schema.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../src/utils/logger.js';

dotenv.config();

/**
 * Rollback migration - revert nested schema to flat structure
 */
const rollback = async () => {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');

    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log(`✓ Connected to DB: ${mongoose.connection.name}`);
        console.log(`✓ Mode: ${isDryRun ? '🔍 DRY RUN (Preview Only)' : '⏮️  ROLLBACK'}`);
        console.log('─'.repeat(60));

        const collection = mongoose.connection.collection('books');
        const totalDocs = await collection.countDocuments({});
        console.log(`📚 Total documents in collection: ${totalDocs}\n`);

        const cursor = collection.find({});

        let processed = 0;
        let skipped = 0;
        let errors = 0;
        const errorDocs = [];

        console.log('Starting rollback...\n');

        while (await cursor.hasNext()) {
            const doc = await cursor.next();

            try {
                // Skip if already in old format (flat structure)
                if (typeof doc.title === 'string') {
                    skipped++;
                    if (isDryRun && skipped <= 2) {
                        console.log(`⏭️  [SKIP] "${doc.title}" - Already in flat format`);
                    }
                    continue;
                }

                // Skip if title is not in expected nested format
                if (!doc.title || typeof doc.title !== 'object' || !doc.title.display) {
                    console.warn(`⚠️  [WARN] Doc ${doc._id} has unexpected title format, skipping`);
                    skipped++;
                    continue;
                }

                // Revert to flat structure
                const flatTitle = doc.title.display;
                const flatPrice =
                    doc.price && typeof doc.price === 'object' ? doc.price.original : doc.price;

                // Preview in dry-run mode
                if (isDryRun) {
                    if (processed < 5) {
                        console.log(`\n📖 [PREVIEW] Document: ${doc._id}`);
                        console.log(`   Current Title: ${JSON.stringify(doc.title)}`);
                        console.log(`   Rollback Title: "${flatTitle}"`);
                        console.log(`   Current Price: ${JSON.stringify(doc.price)}`);
                        console.log(`   Rollback Price: ${flatPrice}`);
                    }
                    processed++;
                    continue;
                }

                // Execute rollback
                await collection.updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            title: flatTitle,
                            price: flatPrice,
                        },
                        $unset: {
                            language: '',
                            academicGrade: '',
                            tags: '',
                        },
                    }
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
                console.error(`\n❌ [ERROR] Failed to rollback doc ${doc._id}: ${err.message}`);
            }
        }

        // Final Summary
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('📊 ROLLBACK SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Successfully processed: ${processed}`);
        console.log(`⏭️  Skipped (already flat): ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`📚 Total documents: ${totalDocs}`);
        console.log('═'.repeat(60));

        if (isDryRun) {
            console.log('\n🔍 DRY RUN COMPLETE - No changes were made to the database');
            console.log('   Run without --dry-run flag to execute rollback');
        } else {
            console.log('\n✅ ROLLBACK COMPLETE!');
            console.log('\n⚠️  REMEMBER TO:');
            console.log('   1. Rebuild indexes if needed');
            console.log('   2. Verify data integrity');
            console.log('   3. Revert Book.js model to old schema');
        }

        if (errors > 0) {
            console.log('\n❌ FAILED DOCUMENTS:');
            errorDocs.forEach((err) => {
                console.log(`   ID: ${err.id}, Error: ${err.error}`);
            });
            logger.error('Rollback completed with errors', { errorDocs });
        }
    } catch (error) {
        console.error('\n💥 ROLLBACK FATAL ERROR:', error.message);
        logger.error('Rollback fatal error', { error: error.message, stack: error.stack });
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
};

// Execute rollback
rollback();
