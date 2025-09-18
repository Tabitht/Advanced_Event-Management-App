/**
 * @module src/Middleware/authMiddleware
 * @description Middleware for authenticating requests using JWT.
 */
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../Utils/jwt.js";
import HttpError from "../Utils/HttpError.js";

interface AuthenticationRequest extends Request {
  user?: { id: string; email: string; role?: string };
}

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
export type { AuthenticationRequest };
