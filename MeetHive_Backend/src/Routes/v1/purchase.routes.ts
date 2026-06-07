/**
 * @module src/Routes/v1/payment.routes.ts
 * @description Routes for tickets purchase and payments related endpoints.
 */
import { Router } from "express";
import authenticate from "../../Middleware/authenticate.middleware.js";
import validate from "../../Middleware/validation.middleware.js";
import { PurchaseSchema } from "../../validationSchemas/purchase.Schema.js";
import { purchaseTicketsController } from "../../Controllers/v1/purchase.controllers.js";

const router = Router();

/**
 * @route POST /api/v1/events/:eventId/purchase
 * @description initiates the purchase of a ticket
 * @access Private
 */
router.post(
  "/:eventId/purchase",
  authenticate,
  validate(PurchaseSchema),
  purchaseTicketsController
);
