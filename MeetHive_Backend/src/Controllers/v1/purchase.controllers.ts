/**
 * @module src/Controllers/purchase.controllers.ts
 * @description Controller layer for handling purchase-related HTTP requests.
 */

import { Response, NextFunction } from "express";
import { AuthenticationRequest } from "../../types/user.types.js";
import { initializeTicketPurchase } from "../../Services/purchase.services.js";

/**
 * @controller purchaseTicketsController
 * @description Initializes the purchase of an event tickets.
 * @param {Request} request - Authenticated request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response
 */
const purchaseTicketsController = async (
  request: AuthenticationRequest,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const eventId = request.params.eventId;
    if (!eventId) {
      return response.status(400).json({ error: "eventId is required" });
    }
    const result = await initializeTicketPurchase({
      userId: request.user?.id,
      eventId,
      ...request.body,
    });
    return response.status(201).json({ result });
  } catch (error) {
    next(error);
  }
};

export { purchaseTicketsController };
