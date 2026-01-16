import mongoose from 'mongoose';
import Book from '../src/models/Book.js';

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

const diagnose = async () => {
    await connectDB();
    console.log('\n--- DIAGNOSING FAKIR MOHAN SENAPATI BOOKS ---');

    // Find books with "Fakir" in the author field (case insensitive)
    const books = await Book.find({ author: { $regex: 'Fakir', $options: 'i' } }).lean();

    console.log(`Found ${books.length} books by Fakir Mohan Senapati:\n`);

    books.forEach(b => {
        const title = b.title?.display || b.title;
        console.log(`- Title: "${title}"`);
        console.log(`  Category: "${b.category}"`);
        console.log(`  ID: ${b._id}`);
        console.log('---');
    });

    // Also check detailed categories available
    const categories = await Book.distinct('category');
    console.log('\nALL AVAILABLE CATEGORIES IN DB:', categories);

    process.exit(0);
};

diagnose();
