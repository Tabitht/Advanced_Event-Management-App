/**
 * @module src/Middelware/errorHandler.middelware.ts
 * @description central error handler for handling errors and their status code
 */
import { Request, Response, NextFunction } from "express";
import HttpError from "../Utils/HttpError.js";

// custom middelware error handler
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
