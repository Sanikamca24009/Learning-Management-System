const { Queue, Worker } = require('bullmq');
const { getRedisClient, isRedisConnected } = require('./redis');

const queues = {};
const workers = {};

// Fallback in-memory queue processor
const processFallbackJob = (queueName, jobName, data, workerProcessor) => {
  console.log(`[Queue Fallback] Processing job '${jobName}' on queue '${queueName}' asynchronously...`);
  setTimeout(async () => {
    try {
      await workerProcessor({ name: jobName, data, id: `fallback-${Date.now()}` });
      console.log(`[Queue Fallback] Job '${jobName}' on queue '${queueName}' completed.`);
    } catch (err) {
      console.error(`[Queue Fallback] Job '${jobName}' on queue '${queueName}' failed:`, err);
    }
  }, 100);
};

// Create a queue helper
const createQueue = (queueName) => {
  if (queues[queueName]) return queues[queueName];

  if (isRedisConnected()) {
    const redisClient = getRedisClient();
    // BullMQ needs ioredis connection
    queues[queueName] = new Queue(queueName, { connection: redisClient });
    console.log(`[Queue] Real BullMQ Queue '${queueName}' created.`);
  } else {
    // Mock queue interface matching BullMQ Queue
    queues[queueName] = {
      add: async (jobName, data) => {
        const worker = workers[queueName];
        if (worker) {
          processFallbackJob(queueName, jobName, data, worker.processor);
        } else {
          console.warn(`[Queue Fallback] No worker registered for queue '${queueName}'. Job '${jobName}' skipped.`);
        }
        return { id: `mock-job-${Date.now()}` };
      },
      addBulk: async (jobs) => {
        for (const job of jobs) {
          const worker = workers[queueName];
          if (worker) {
            processFallbackJob(queueName, job.name, job.data, worker.processor);
          }
        }
        return jobs.map(() => ({ id: `mock-job-${Date.now()}` }));
      }
    };
    console.log(`[Queue] Fallback Mock Queue '${queueName}' initialized.`);
  }

  return queues[queueName];
};

// Register a worker
const registerWorker = (queueName, processor) => {
  if (isRedisConnected()) {
    const redisClient = getRedisClient();
    workers[queueName] = new Worker(queueName, processor, { connection: redisClient });
    console.log(`[Queue] Real BullMQ Worker registered for '${queueName}'.`);
  } else {
    workers[queueName] = {
      processor,
      close: async () => {}
    };
    console.log(`[Queue] Fallback Mock Worker registered for '${queueName}'.`);
  }
};

module.exports = {
  createQueue,
  registerWorker
};
