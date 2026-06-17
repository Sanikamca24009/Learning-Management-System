const { registerWorker, createQueue } = require('../config/queue');

const EMAIL_QUEUE_NAME = 'email-queue';

const emailProcessor = async (job) => {
  const { to, subject, body } = job.data;
  console.log(`[Email Worker] Sending email to: ${to}`);
  console.log(`[Email Worker] Subject: ${subject}`);
  console.log(`[Email Worker] Body: ${body}`);
  
  // Simulate network latency of sending email
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  console.log(`[Email Worker] Email to ${to} sent successfully.`);
};

// Initialize email worker & queue
const initEmailQueue = () => {
  registerWorker(EMAIL_QUEUE_NAME, emailProcessor);
  return createQueue(EMAIL_QUEUE_NAME);
};

module.exports = { initEmailQueue, EMAIL_QUEUE_NAME };
