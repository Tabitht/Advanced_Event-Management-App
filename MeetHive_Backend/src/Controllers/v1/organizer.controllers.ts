/**
 * @module src/Controllers/.controllers.ts
 * @description Controller layer for handling organizer-related HTTP requests.
 */

import { Request, Response, NextFunction } from "express";
import {
  createOrganizer,
  updateOrganizer,
  getSingleOrganizer,
  getAllOrganizers,
} from "../../Services/organizer.services.js";

/**
 * @controller createOrganizerController
 * @description Creates a new organizer profile.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with created organizer data
 */
const createOrganizerController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const userId = request.params.userId;
  if (!userId) {
    return response.status(400).json({ error: "userId is required" });
  }
  try {
    const organizer = await createOrganizer(userId, request.body);
    return response.status(201).json({ organizer });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller updateOrganizerController
 * @description Updates an existing organizer profile.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with updated organizer data
 */
const updateOrganizerController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const organizerId = request.params.organizerId;
  if (!organizerId) {
    return response.status(400).json({ error: "organizerId is required" });
  }
  try {
    const organizer = await updateOrganizer(organizerId, request.body);
    return response.status(200).json({ organizer });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getOrganizerByIdController
 * @description Retrieves a single organizer profile by ID.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with organizer data
 */
const getOrganizerByIdController = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const organizerId = request.params.organizerId;
  if (!organizerId) {
    return response.status(400).json({ error: "organizerId is required" });
  }
  try {
    const organizer = await getSingleOrganizer(organizerId);
    return response.status(200).json({ organizer });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getAllOrganizersController
 * @description Retrieves all organizer profiles.
 * @param {Request} _request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with list of organizers
 */
const getAllOrganizersController = async (
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const organizers = await getAllOrganizers();
    return response.status(200).json({ organizers });
  } catch (error) {
    next(error);
  }
};

export {
  createOrganizerController,
  updateOrganizerController,
  getOrganizerByIdController,
  getAllOrganizersController,
};
