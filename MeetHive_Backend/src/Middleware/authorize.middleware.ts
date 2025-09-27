/**
 * @module src/Middleware/authorize.middleware.ts
 * @description Middleware for role-based authorization.
 */
import { NextFunction, Response } from "express";
import { AuthenticationRequest } from "../types/user.types.js";
import HttpError from "../Utils/HttpError.js";

// Middleware to check if the user has one of the allowed roles
const authorize =
  (...allowedRoles: string[]) =>
  (request: AuthenticationRequest, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new HttpError(401, "Unauthorized")); // Pass to error handler
    }

    if (!allowedRoles.includes(request.user.role ?? "")) {
      return next(new HttpError(403, "Forbidden - You do not have permission"));
    }

    next();
  };

export default authorize;
