const monitorMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Extract properties for logging
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const cacheHeader = res.getHeader('X-Cache') || 'NONE';

    const logMessage = `[API Monitor] ${method} ${originalUrl} - Status: ${statusCode} - Latency: ${timeInMs}ms - Cache: ${cacheHeader}`;
    
    if (parseFloat(timeInMs) > 500) {
      console.warn(`\x1b[33m${logMessage} [SLOW REQUEST WARNING]\x1b[0m`);
    } else {
      console.log(logMessage);
    }
  });

  next();
};

module.exports = { monitorMiddleware };
