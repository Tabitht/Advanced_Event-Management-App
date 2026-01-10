/**
 * @module src/Routes/.routes.ts
 * @description Routes for organizer-related endpoints.
 */

import { Router } from "express";
import authenticate from "../../Middleware/authenticate.middleware.js";

import {
  createOrganizerController,
  updateOrganizerController,
  getOrganizerByIdController,
  getAllOrganizersController,
} from "../../Controllers/v1/organizer.controllers.js";

const router = Router();

/**
 * @route POST /api/v1/organizers/user/:userId
 * @description Create a new organizer profile for a specific user
 * @access Private
 */
router.post("/user/:userId", authenticate, createOrganizerController);

/**
 * @route PUT /api/v1/organizers/:organizerId
 * @description Updates an existing organizer profile
 * @access Private
 */
router.put("/:organizerId", authenticate, updateOrganizerController);

/**
 * @route GET /api/v1/organizers
 * @description Retrieves all organizers
 * @access Public
 */
router.get("/", getAllOrganizersController);

/**
 * @route GET /api/v1/organizers/:organizerId
 * @description Retrieves a single organizer by its ID
 * @access Public
 */
router.get("/:organizerId", getOrganizerByIdController);

export default router;
