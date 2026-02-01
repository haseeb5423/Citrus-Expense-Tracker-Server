// Rate limiting middleware to prevent abuse
const rateLimit = new Map();

const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean old entries
    const cleanupThreshold = now - windowMs;
    for (const [key, data] of rateLimit.entries()) {
      if (data.resetTime < cleanupThreshold) {
        rateLimit.delete(key);
      }
    }
    
    // Get or create rate limit data for this identifier
    if (!rateLimit.has(identifier)) {
      rateLimit.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const userData = rateLimit.get(identifier);
    
    // Check if window has expired
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
      return next();
    }
    
    // Increment count
    userData.count++;
    
    // Check if limit exceeded
    if (userData.count > maxRequests) {
      const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: retryAfter
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - userData.count);
    res.setHeader('X-RateLimit-Reset', new Date(userData.resetTime).toISOString());
    
    next();
  };
};

// Different rate limiters for different endpoints
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes for API
export const strictLimiter = createRateLimiter(60 * 1000, 3); // 3 requests per minute for sensitive operations
