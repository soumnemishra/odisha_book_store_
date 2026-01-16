import axios from 'axios';

const testAPI = async () => {
    try {
        console.log('--- Testing Search API ---');
        const url = 'http://localhost:5000/api/v1/books?search=nov';
        console.log(`GET ${url}`);

        const res = await axios.get(url);

        console.log(`Status: ${res.status}`);
        console.log(`Success: ${res.data.success}`);
        console.log(`Total Books Found: ${res.data.totalBooks}`);
        console.log(`Books in Response: ${res.data.books?.length}`);

        if (res.data.books?.length > 0) {
            console.log('Sample Book:', res.data.books[0].titleDisplay || res.data.books[0].title);
        } else {
            console.log('❌ No books found.');
        }

    } catch (error) {
        console.error('API Test Failed:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
};

testAPI();
