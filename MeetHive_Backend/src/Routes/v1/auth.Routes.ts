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
  refreshController,
  logoutController,
  logoutAllController,
} from "../../Controllers/v1/auth.controllers.js";
import authenticate from "../../Middleware/authenticate.middleware.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registrationSchema),
  registerController
);
router.post("/login", authLimiter, validate(loginSchema), loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/logout-all", authenticate, logoutAllController);

export default router;
