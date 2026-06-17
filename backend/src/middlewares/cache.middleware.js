const { getCache, setCache, clearCache } = require('../config/redis');

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL path and query string
    const key = req.originalUrl || req.url;

    try {
      // Check if key exists in cache
      const cachedResponse = await getCache(key);
      
      if (cachedResponse) {
        // Return cached response
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedResponse);
      }
      
      res.setHeader('X-Cache', 'MISS');
      // Overwrite res.json to cache the response body before sending it
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, duration).catch(err => console.error('Cache set error in middleware:', err));
        }
        return originalJson(body);
      };
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

module.exports = { cacheMiddleware, clearCache };
