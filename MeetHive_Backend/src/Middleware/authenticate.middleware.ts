/**
 * @module src/Middleware/auth.middleware.ts
 * @description Middleware for authenticating requests using JWT.
 */
import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../Utils/jwt.js";
import HttpError from "../Utils/HttpError.js";
import { AuthenticationRequest } from "../types/user.types.js";

/**
 * @function authenticate
 * @description Middleware to authenticate requests using JWT access tokens.
 * @param {AuthenticationRequest} request - Express request object with optional user property
 * @param {Response} _response - Express response object (not used)
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authenticate = (
  request: AuthenticationRequest,
  _response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized, please log in to continue"));
  }

  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = verifyAccessToken(token) as {
      id: string;
      email: string;
      role?: string;
    };
    request.user = decoded;
    next();
    return;
  } catch (error) {
    console.error("Missing or Invalid token:", error);
    next(new HttpError(401, "Missing or invalid token"));
  }
};

export default authenticate;
