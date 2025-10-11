/**
 * @module src/Middleware/rateLimiter.middleware.ts
 * @description configures and exports rate limiting middleware for Express routes.
 */

import rateLimit from "express-rate-limit";

/**
 * @function generalLimiter
 * @description limits incoming requests to general routes to prevent abuse.
 * @note Limits to 100 requests per 15 minutes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @function authLimiter
 * @description Rate limiter specifically for authentication routes.
 * @note Limits to 5 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { generalLimiter, authLimiter };
