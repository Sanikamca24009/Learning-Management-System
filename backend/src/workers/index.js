const { initEmailQueue } = require('./email.worker');
const { initReportQueue } = require('./report.worker');
const { initCronQueue } = require('./cron.worker');

let emailQueue;
let reportQueue;
let cronQueue;

const initWorkers = () => {
  console.log('Initializing background workers and queues...');
  emailQueue = initEmailQueue();
  reportQueue = initReportQueue();
  cronQueue = initCronQueue();
  console.log('Background workers and queues initialized.');
};

module.exports = {
  initWorkers,
  getEmailQueue: () => emailQueue,
  getReportQueue: () => reportQueue,
  getCronQueue: () => cronQueue
};
