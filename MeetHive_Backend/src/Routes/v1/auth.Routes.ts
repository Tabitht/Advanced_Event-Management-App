/**
 * @module src/Routes/auth.routes.ts
 * @description Routes for authentication-related endpoints.
 */

import { Router } from "express";
import validate from "../../Middleware/validation.middleware.js";
import { authLimiter } from "../../Middleware/rateLimiter.middleware.js";
import {
  registrationSchema,
  loginSchema,
} from "../../validationSchemas/auth.Schema.js";
import {
  registerController,
  loginController,
  verifyEmailController,
  refreshController,
  logoutController,
  logoutAllController,
} from "../../Controllers/v1/auth.controllers.js";
import authenticate from "../../Middleware/authenticate.middleware.js";

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 */
router.post(
  "/register",
  authLimiter,
  validate(registrationSchema),
  registerController
);

/**
 * @route POST /api/v1/auth/verify-email
 * @description verifies a registered user email account
 * @access Public
 */
router.post("/verify-email", authLimiter, verifyEmailController);

/**
 * @route POST /api/v1/auth/login
 * @description Log in a user
 * @access Public
 */
router.post("/login", authLimiter, validate(loginSchema), loginController);

/**
 * @route POST /api/v1/auth/refresh
 * @description Refresh access token using refresh token
 * @access Public
 */
router.post("/refresh", refreshController);

/**
 * @route POST /api/v1/auth/logout
 * @description Log out the current user by revoking the refresh token
 * @access Private
 */
router.post("/logout", authenticate, logoutController);

/**
 * @route POST /api/v1/auth/logoutAll
 * @description Log out the current user from all sessions by revoking all refresh tokens
 * @access Private
 */
router.post("/logoutAll", authenticate, logoutAllController);

export default router;
