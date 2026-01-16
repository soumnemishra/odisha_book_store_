import mongoose from 'mongoose';
import Book from '../src/models/Book.js'; // Adjust path if needed
import searchService from '../src/services/searchService.js';
import { config } from '../src/config/env.js';

// Mock DB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI environment variable is not set');
            console.error('Please set MONGODB_URI in your .env file');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
};

const debugSearch = async () => {
    await connectDB();

    console.log('\n--- 1. Checking Raw Data ---');
    const sampleBooks = await Book.find().limit(3).lean();
    sampleBooks.forEach(b => {
        console.log(`ID: ${b._id}`);
        console.log(`Title Type: ${typeof b.title}`);
        console.log(`Title Value:`, b.title);
        if (typeof b.title === 'string') console.log('⚠️ LEGACY STRING TITLE DETECTED');
    });

    console.log('\n--- 2. Initializing Search Service ---');
    await searchService.refreshIndex();

    // Hack access to private fuse instance to check collection size
    if (searchService.fuse) { // Check implementation details
        console.log('Fuse Index Initialized.');
    } else {
        console.log('❌ Fuse Index NOT Initialized');
    }

    console.log('\n--- 3. Testing Search Queries ---');
    const queries = ['nov', 'guide', 'class', 'odia'];

    for (const q of queries) {
        const results = await searchService.search(q);
        console.log(`Query: "${q}" -> Found: ${results.length} matches`);
        if (results.length > 0) {
            console.log('   Top Match:', results[0].item.title);
        }
    }

    console.log('\n--- Done ---');
    process.exit(0);
};

debugSearch();
