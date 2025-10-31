/**
 * @module src/Middleware/authorize.middleware.ts
 * @description Middleware for role-based authorization.
 */
import { NextFunction, Response } from "express";
import { AuthenticationRequest } from "../types/user.types.js";
import HttpError from "../Utils/HttpError.js";

/**
 * @function authorize
 * @description Middleware to authorize users based on their roles.
 * @param {...string} allowedRoles - Roles that are permitted to access the route (e.g., 'admin', 'user')
 * @returns {Function} Middleware function to check user roles
 */
const authorize =
  (...allowedRoles: string[]) =>
  (request: AuthenticationRequest, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new HttpError(401, "Unauthorized"));
    }

    if (!allowedRoles.includes(request.user.role ?? "")) {
      return next(new HttpError(403, "Forbidden - You do not have permission"));
    }

    next();
  };

export default authorize;
