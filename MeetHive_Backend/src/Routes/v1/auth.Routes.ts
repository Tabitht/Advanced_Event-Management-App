/**
 * @module src/Routes/auth.Routes.ts
 * @description Routes for authentication-related endpoints.
 */

import { Router } from "express";
import validate from "../../Middleware/validationMiddleware.js";
import { authLimiter } from "../../Middleware/rateLimiter.js";
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
} from "../../Controllers/v1/authController.js";
import authenticate from "../../Middleware/authenticate.js";

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
