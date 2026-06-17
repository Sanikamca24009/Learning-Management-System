const express = require('express');
const { prisma } = require('../config/db');
const { isRedisConnected } = require('../config/redis');
const { getEmailQueue } = require('../workers');

const router = express.Router();

router.get('/', async (req, res) => {
  const status = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'down',
      redis: 'down',
      queues: 'down'
    }
  };

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'up';
  } catch (err) {
    console.error('[Health Check] Database is down:', err.message);
  }

  // Check Redis
  if (isRedisConnected()) {
    status.services.redis = 'up';
  } else {
    status.services.redis = 'fallback_mode';
  }

  // Check Queues
  const emailQueue = getEmailQueue();
  if (emailQueue) {
    status.services.queues = 'up';
  }

  const overallStatus = 
    status.services.database === 'up' && 
    (status.services.redis === 'up' || status.services.redis === 'fallback_mode')
      ? 200
      : 503;

  res.status(overallStatus).json({
    status: overallStatus === 200 ? 'healthy' : 'unhealthy',
    ...status
  });
});

module.exports = router;
