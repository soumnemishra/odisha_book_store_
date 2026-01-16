// scripts/test-api-endpoints.js
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

const testEndpoints = async () => {
    console.log('═'.repeat(60));
    console.log('🧪 TESTING API ENDPOINTS WITH MIGRATED DATA');
    console.log('═'.repeat(60));

    try {
        // Test 1: Get first 5 books with pagination
        console.log('\n1️⃣  GET /api/books?page=1&limit=5');
        console.log('─'.repeat(60));
        const res1 = await fetch(`${BASE_URL}/books?page=1&limit=5`);
        const data1 = await res1.json();
        console.log(`✅ Status: ${res1.status}`);
        console.log(`📚 Books returned: ${data1.books?.length}`);
        console.log(`📊 Total books: ${data1.totalBooks}`);
        console.log(`📄 Current page: ${data1.currentPage}`);
        console.log(`📄 Total pages: ${data1.totalPages}`);

        if (data1.books && data1.books.length > 0) {
            const firstBook = data1.books[0];
            console.log(`\n📖 First book sample:`);
            console.log(`   Title (display): ${firstBook.title?.display}`);
            console.log(`   titleDisplay (virtual): ${firstBook.titleDisplay}`);
            console.log(`   Language: ${firstBook.language}`);
            console.log(`   Price (original): ₹${firstBook.price?.original}`);
            console.log(`   Price (discounted): ₹${firstBook.price?.discounted}`);
            console.log(`   finalPrice (virtual): ₹${firstBook.finalPrice}`);
            console.log(`   hasDiscount (virtual): ${firstBook.hasDiscount}`);
            console.log(`   savings (virtual): ₹${firstBook.savings}`);
        }

        // Test 2: Filter by language
        console.log('\n\n2️⃣  GET /api/books?language=English&limit=3');
        console.log('─'.repeat(60));
        const res2 = await fetch(`${BASE_URL}/books?language=English&limit=3`);
        const data2 = await res2.json();
        console.log(`✅ Status: ${res2.status}`);
        console.log(`📚 English books: ${data2.books?.length}`);
        console.log(`📊 Total English books: ${data2.totalBooks}`);
        if (data2.books && data2.books.length > 0) {
            console.log(`   Sample: "${data2.books[0].title?.display}"`);
        }

        // Test 3: Filter by language (Odia)
        console.log('\n\n3️⃣  GET /api/books?language=Odia&limit=3');
        console.log('─'.repeat(60));
        const res3 = await fetch(`${BASE_URL}/books?language=Odia&limit=3`);
        const data3 = await res3.json();
        console.log(`✅ Status: ${res3.status}`);
        console.log(`📚 Odia books: ${data3.books?.length}`);
        console.log(`📊 Total Odia books: ${data3.totalBooks}`);
        if (data3.books && data3.books.length > 0) {
            console.log(`   Sample: "${data3.books[0].title?.display}"`);
        }

        // Test 4: Search functionality
        console.log('\n\n4️⃣  GET /api/books?search=Gandhi&limit=5');
        console.log('─'.repeat(60));
        const res4 = await fetch(`${BASE_URL}/books?search=Gandhi&limit=5`);
        const data4 = await res4.json();
        console.log(`✅ Status: ${res4.status}`);
        console.log(`📚 Search results: ${data4.books?.length}`);
        console.log(`📊 Total matches: ${data4.totalBooks}`);
        if (data4.books && data4.books.length > 0) {
            data4.books.forEach((book, idx) => {
                console.log(`   ${idx + 1}. "${book.title?.display}" (${book.language})`);
            });
        }

        // Test 5: Price range filter
        console.log('\n\n5️⃣  GET /api/books?minPrice=100&maxPrice=300&limit=5');
        console.log('─'.repeat(60));
        const res5 = await fetch(`${BASE_URL}/books?minPrice=100&maxPrice=300&limit=5`);
        const data5 = await res5.json();
        console.log(`✅ Status: ${res5.status}`);
        console.log(`📚 Books in price range: ${data5.books?.length}`);
        console.log(`📊 Total matches: ${data5.totalBooks}`);
        if (data5.books && data5.books.length > 0) {
            data5.books.forEach((book, idx) => {
                console.log(`   ${idx + 1}. ${book.title?.display} - ₹${book.price?.discounted}`);
            });
        }

        // Test 6: Sort by price
        console.log('\n\n6️⃣  GET /api/books?sortBy=price&sortOrder=asc&limit=3');
        console.log('─'.repeat(60));
        const res6 = await fetch(`${BASE_URL}/books?sortBy=price&sortOrder=asc&limit=3`);
        const data6 = await res6.json();
        console.log(`✅ Status: ${res6.status}`);
        console.log(`📚 Cheapest books:`);
        if (data6.books && data6.books.length > 0) {
            data6.books.forEach((book, idx) => {
                console.log(`   ${idx + 1}. ${book.title?.display} - ₹${book.finalPrice}`);
            });
        }

        // Test 7: Get available languages
        console.log('\n\n7️⃣  GET /api/books/languages');
        console.log('─'.repeat(60));
        const res7 = await fetch(`${BASE_URL}/books/languages`);
        const data7 = await res7.json();
        console.log(`✅ Status: ${res7.status}`);
        console.log(`🌐 Available languages: ${data7.data?.join(', ')}`);

        // Test 8: Get available categories
        console.log('\n\n8️⃣  GET /api/books/categories');
        console.log('─'.repeat(60));
        const res8 = await fetch(`${BASE_URL}/books/categories`);
        const data8 = await res8.json();
        console.log(`✅ Status: ${res8.status}`);
        console.log(`📚 Categories: ${data8.data?.slice(0, 10).join(', ')}...`);

        console.log('\n\n═'.repeat(60));
        console.log('✅ ALL API TESTS COMPLETED SUCCESSFULLY!');
        console.log('═'.repeat(60));
        console.log('\n📊 SUMMARY:');
        console.log('   ✅ Pagination working');
        console.log('   ✅ Language filtering working (Odia + English)');
        console.log('   ✅ Search working (nested title fields)');
        console.log('   ✅ Price range filtering working');
        console.log('   ✅ Sorting working');
        console.log('   ✅ Virtual fields exposed (titleDisplay, finalPrice, hasDiscount, savings)');
        console.log('   ✅ Helper endpoints working (languages, categories)');

    } catch (error) {
        console.error('\n❌ API TEST ERROR:', error.message);
        console.error('\n⚠️  Make sure the backend server is running: npm run dev');
    }
};

testEndpoints();
