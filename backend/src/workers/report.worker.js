const { registerWorker, createQueue } = require('../config/queue');
const fs = require('fs');
const path = require('path');

const REPORT_QUEUE_NAME = 'report-queue';

const reportProcessor = async (job) => {
  const { reportType, userId } = job.data;
  console.log(`[Report Worker] Generating ${reportType} report for User: ${userId}`);

  // Simulate heavy processing (e.g. database querying, calculation, formatting)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const reportsDir = path.join(__dirname, '../../uploads/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `report-${reportType}-${userId}-${Date.now()}.json`;
  const filePath = path.join(reportsDir, fileName);

  const reportData = {
    reportType,
    generatedBy: userId,
    generatedAt: new Date().toISOString(),
    status: 'completed',
    metrics: {
      totalViews: Math.floor(Math.random() * 1000) + 100,
      activeEnrollments: Math.floor(Math.random() * 50) + 5,
      revenueUSD: Math.floor(Math.random() * 10000) + 500
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  console.log(`[Report Worker] Report successfully written to: ${filePath}`);
};

const initReportQueue = () => {
  registerWorker(REPORT_QUEUE_NAME, reportProcessor);
  return createQueue(REPORT_QUEUE_NAME);
};

module.exports = { initReportQueue, REPORT_QUEUE_NAME };
