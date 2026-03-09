/**
 * @module src/Routes/event.routes.ts
 * @description Routes for event-related endpoints.
 */

import { Router } from "express";
import authenticate from "../../Middleware/authenticate.middleware.js";
import authorize from "../../Middleware/authorize.middleware.js";
import {
  createEventController,
  updateEventController,
  getEventByIdController,
  getAllEventsController,
  publishEventController,
  deleteEventController,
} from "../../Controllers/v1/event.controllers.js";

const router = Router();

/**
 * @route POST /api/v1/events/organizer/:organizerId
 * @description Create a new event for a specific organizer
 * @access Private
 */
router.post(
  "/organizer/:organizerId",
  authenticate,
  authorize("ORGANIZER"),
  createEventController
);

/**
 * @route PUT /api/v1/events/:eventId
 * @description Updates an existing event
 * @access Private
 */
router.put(
  "/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  updateEventController
);

/**
 * @route GET /api/v1/events
 * @description Retrieves all published and non-archived events
 * @access Public
 */
router.get("/", getAllEventsController);

/**
 * @route PATCH /api/v1/events/publish/:eventId
 * @description Publishes an event
 * @access Private
 */
router.patch(
  "/publish/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  publishEventController
);

/**
 * @route GET /api/v1/events/:eventId
 * @description Retrieves a single event by its ID
 * @access Public
 */
router.get("/:eventId", getEventByIdController);

/**
 * @route DELETE /api/v1/events/:eventId
 * @description Soft deletes an event by its ID
 * @access Private
 */
router.delete(
  "/:eventId",
  authenticate,
  authorize("ORGANIZER"),
  deleteEventController
);

export default router;
