const autocannon = require('autocannon');

const runStressTest = () => {
  const url = 'http://localhost:5000/api/courses';

  console.log(`Starting stress test on ${url}...`);

  const instance = autocannon({
    url,
    connections: 100, // Simulate 100 concurrent users
    pipelining: 10,
    duration: 10, // Run for 10 seconds
  });

  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    console.log('\n--- STRESS TEST RESULTS ---');
    console.log(`Total Requests: ${result.requests.total}`);
    console.log(`Average Latency: ${result.latency.average} ms`);
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);
    console.log('---------------------------\n');

    if (result.errors > 0 || result.timeouts > 0) {
      console.warn('⚠️ Some requests failed or timed out. Consider scaling the server.');
    } else {
      console.log('✅ Server handled the load perfectly. Caching is highly effective!');
    }
  });
};

runStressTest();
