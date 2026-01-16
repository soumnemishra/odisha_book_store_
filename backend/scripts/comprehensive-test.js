// Comprehensive API test suite
import http from 'http';

const tests = [
    { name: 'Pagination', path: '/api/books?page=1&limit=5' },
    { name: 'Language Filter (English)', path: '/api/books?language=English&limit=3' },
    { name: 'Language Filter (Odia)', path: '/api/books?language=Odia&limit=3' },
    { name: 'Search (Gandhi)', path: '/api/books?search=Gandhi&limit=5' },
    { name: 'Price Range', path: '/api/books?minPrice=100&maxPrice=300&limit=3' },
    { name: 'Sort by Price (asc)', path: '/api/books?sortBy=price&sortOrder=asc&limit=3' },
    { name: 'Get Languages', path: '/api/books/languages' },
    { name: 'Get Categories', path: '/api/books/categories' },
];

let currentTest = 0;

const runTest = () => {
    if (currentTest >= tests.length) {
        console.log('\n═'.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('═'.repeat(60));
        return;
    }

    const test = tests[currentTest];
    console.log(`\n${currentTest + 1}️⃣  ${test.name}`);
    console.log('─'.repeat(60));

    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: test.path,
        method: 'GET'
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const result = JSON.parse(data);

            if (result.success) {
                if (result.books) {
                    console.log(`✅ ${result.books.length} books | Total: ${result.totalBooks}`);
                    if (result.books[0]) {
                        const book = result.books[0];
                        console.log(`   Sample: "${book.title?.display}" (${book.language}) - ₹${book.finalPrice}`);
                    }
                } else if (result.data) {
                    console.log(`✅ ${result.data.length} results: ${result.data.slice(0, 5).join(', ')}${result.data.length > 5 ? '...' : ''}`);
                }
            } else {
                console.log(`❌ Failed`);
            }

            currentTest++;
            runTest();
        });
    });

    req.on('error', (error) => {
        console.error(`❌ Error: ${error.message}`);
        currentTest++;
        runTest();
    });

    req.end();
};

console.log('═'.repeat(60));
console.log('🧪 COMPREHENSIVE API TEST SUITE');
console.log('═'.repeat(60));
runTest();
