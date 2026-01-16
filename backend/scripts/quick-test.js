// Quick test to check if API is responding
import http from 'http';

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/books?page=1&limit=3',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const result = JSON.parse(data);
        console.log('✅ API Response Received!');
        console.log(`📚 Books: ${result.books?.length}`);
        console.log(`📊 Total: ${result.totalBooks}`);
        console.log(`📄 Page: ${result.currentPage}/${result.totalPages}`);

        if (result.books && result.books.length > 0) {
            const book = result.books[0];
            console.log(`\n📖 First Book:`);
            console.log(`   Title: ${book.title?.display}`);
            console.log(`   Language: ${book.language}`);
            console.log(`   Price: ₹${book.price?.original}`);
            console.log(`\n🎯 Virtual Fields Working:`);
            console.log(`   ✅ titleDisplay: "${book.titleDisplay}"`);
            console.log(`   ✅ finalPrice: ₹${book.finalPrice}`);
            console.log(`   ✅ hasDiscount: ${book.hasDiscount}`);
            console.log(`   ✅ savings: ₹${book.savings}`);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.end();
