/**
 * @module src/Middelware/errorHandler.middelware.ts
 * @description central error handler for handling errors and their status code
 */
import { Request, Response, NextFunction } from "express";
import HttpError from "../Utils/httpError.js";

/**
 * @function errorHandler
 * @description central error handler for handling errors and their status code
 * @param {Object} error - the error object thrown from any part of the application
 * @param {Object} _request - the express request object
 * @param {Object} response - the express response object
 * @param {Function} _next - the next middleware function in the express middleware chain
 * @returns {Object} the response object with the error message and status code
 */
const errorHandler = (
  error: HttpError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error(error);
  response.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
};

export default errorHandler;
