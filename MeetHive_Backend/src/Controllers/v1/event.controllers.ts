/**
 * @module src/Controllers/event.controllers.ts
 * @description Controller layer for handling event-related HTTP requests.
 */

import { Request, Response, NextFunction } from "express";
import {
  createEvent,
  updateEvent,
  getAllEvent,
  publishEvent,
  softDeleteEvent,
  getSingleEvent,
} from "../../Services/event.services.js";

/**
 * @controller createEventController
 * @description Creates a new event.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with created event data
 */
const createEventController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const organizerId = request.params.organizerId;
    if (!organizerId) {
      return response.status(400).json({ error: "organizerId is required" });
    }
    const event = await createEvent(organizerId, request.body);
    return response.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller updateEventController
 * @description Updates an existing event.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with updated event data
 */
const updateEventController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const eventId = request.params.eventId;
    if (!eventId) {
      return response.status(400).json({ error: "eventId is required" });
    }
    const event = await updateEvent(eventId, request.body);
    return response.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getEventByIdController
 * @description Retrieves an event by its ID.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with event data
 */
const getEventByIdController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const eventId = request.params.eventId;
    if (!eventId) {
      return response.status(400).json({ error: "eventId is required" });
    }
    const event = await getSingleEvent(eventId);
    return response.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getAllEventsController
 * @description Retrieves all events.
 * @param {Request} _request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with list of events
 */
const getAllEventsController = async (
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const events = await getAllEvent();
    return response.status(200).json({ events });
  } catch (error) {
    next(error);
  }
};

/**
 *@controller publishEventController
 *@description Publishes an event by its ID.
 *@param {Request} request - Express request object
 *@param {Response} response - Express response object
 *@param {NextFunction} next - Express next middleware function
 *@returns {Promise<Response>} JSON response confirming publication
 */
const publishEventController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const eventId = request.params.eventId;
    if (!eventId) {
      return response.status(400).json({ error: "eventId is required" });
    }
    const publishedEvent = await publishEvent(eventId);
    return response.status(200).json({ publishedEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller deleteEventController
 * @description Deletes an event by its ID.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response confirming deletion
 */
const deleteEventController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const eventId = request.params.eventId;
    if (!eventId) {
      return response.status(400).json({ error: "eventId is required" });
    }
    await softDeleteEvent(eventId);
    return response.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  createEventController,
  updateEventController,
  getEventByIdController,
  getAllEventsController,
  publishEventController,
  deleteEventController,
};
