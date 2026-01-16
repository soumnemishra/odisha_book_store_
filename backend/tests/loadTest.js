import autocannon from 'autocannon';
import { format } from 'util';

/**
 * Basic Load Testing Script
 * Simulates high traffic to verify system stability and performance.
 * 
 * Usage:
 * node tests/loadTest.js
 */

const targetUrl = 'http://localhost:5000/api/v1';

console.log('🚀 Starting Load Test on:', targetUrl);

const runTest = async () => {
    const result = await autocannon({
        url: targetUrl + '/health',
        connections: 100, // 100 concurrent connections
        pipelining: 1,    // 1 request per connection
        duration: 10,     // 10 seconds
        title: 'Health Check Endpoint Test',
    });

    console.log('\n✅ Load Test Completed!');
    console.log('------------------------------------------------');
    console.log(format('Requests/sec: %d', result.requests.average));
    console.log(format('Latency (average): %d ms', result.latency.average));
    console.log(format('Throughput (average): %d MB/sec', result.throughput.average / 1024 / 1024));
    console.log(format('Errors: %d', result.errors));
    console.log(format('Timeouts: %d', result.timeouts));
    console.log('------------------------------------------------');

    if (result.errors > 0 || result.timeouts > 0) {
        console.error('❌ Test Failed: Errors or Timeouts detected.');
        process.exit(1);
    } else {
        console.log('✨ System is Stable under load.');
    }
};

runTest().catch((err) => {
    console.error('Test Error:', err);
});
