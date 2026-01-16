import axios from 'axios';

const testAPI = async () => {
    try {
        console.log('Testing /api/health...');
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('Health:', health.data);

        console.log('\nTesting /api/v1/books (New API)...');
        const v1 = await axios.get('http://localhost:5000/api/v1/books');
        console.log('V1 Books Count:', v1.data.books?.length);
        console.log('V1 Success:', v1.data.success);

        console.log('\nTesting /api/books (Legacy Alias)...');
        const legacy = await axios.get('http://localhost:5000/api/books');
        console.log('Legacy Books Count:', legacy.data.books?.length);
        console.log('Legacy Success:', legacy.data.success);

    } catch (error) {
        console.error('API Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testAPI();
