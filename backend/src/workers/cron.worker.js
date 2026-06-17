const { registerWorker, createQueue } = require('../config/queue');
const { isRedisConnected } = require('../config/redis');

const CRON_QUEUE_NAME = 'cron-queue';

const cronProcessor = async (job) => {
  console.log(`[Cron Worker] Executing scheduled task: '${job.name}' at ${new Date().toISOString()}`);
  
  if (job.name === 'daily-analytics') {
    console.log('[Cron Worker] Aggregating platform analytics...');
  } else if (job.name === 'cache-cleanup') {
    console.log('[Cron Worker] Cleaning up stale caches...');
  }
};

const initCronQueue = () => {
  registerWorker(CRON_QUEUE_NAME, cronProcessor);
  const queue = createQueue(CRON_QUEUE_NAME);

  if (isRedisConnected()) {
    queue.add('daily-analytics', {}, {
      repeat: { pattern: '0 0 * * *' }
    }).catch(err => console.error('Error adding daily-analytics cron:', err));
    
    queue.add('cache-cleanup', {}, {
      repeat: { pattern: '0 */12 * * *' }
    }).catch(err => console.error('Error adding cache-cleanup cron:', err));
  } else {
    console.log('[Cron Worker] Setting up development interval triggers (every 60s)...');
    setInterval(() => {
      cronProcessor({ name: 'daily-analytics', data: {} }).catch(err => console.error(err));
      cronProcessor({ name: 'cache-cleanup', data: {} }).catch(err => console.error(err));
    }, 60000);
  }

  return queue;
};

module.exports = { initCronQueue, CRON_QUEUE_NAME };
