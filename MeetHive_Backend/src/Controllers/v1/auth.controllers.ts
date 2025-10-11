/**
 * @module src/Controllers/authController.ts
 * @description Controller layer for handling authentication-related HTTP requests.
 */

import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "../../Services/auth.services.js";
import { generateAccessToken } from "../../Utils/jwt.js";
import { setAuthCookie, clearAuthCookie } from "../../Utils/cookies.js";
import { AuthenticationRequest } from "../../types/user.types.js";
import HttpError from "../../Utils/HttpError.js";

/**
 * @controller registerController
 * @description Registers a new user, generates access + refresh tokens, and sends response.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with user data and tokens
 */
export const registerController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(request.body);
    // IP & User Agent for token tracking
    const ip = request.ip;
    const userAgent = request.get("user-agent");

    // Create tokens
    const { refreshToken } = await createRefreshToken(user.id, ip, userAgent);
    const accessToken = generateAccessToken(user);

    // Sets the refresh token
    setAuthCookie(response, refreshToken);

    return response.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller loginController
 * @description Logs a user in by validating credentials and issuing new tokens.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with user data and tokens
 */
export const loginController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = request.body;
    const user = await loginUser(email, password);

    const ip = request.ip;
    const userAgent = request.get("user-agent");

    const { refreshToken } = await createRefreshToken(user.id, ip, userAgent);
    const accessToken = generateAccessToken(user);

    setAuthCookie(response, refreshToken);

    return response.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller refreshController
 * @description Rotates refresh token and returns new access + refresh tokens.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with new tokens
 */
export const refreshController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const oldToken = request.cookies.refreshToken || request.body.refreshToken;
    if (!oldToken) throw new HttpError(401, "Refresh token missing");

    const ip = request.ip;
    const userAgent = request.get("user-agent");

    const { refreshToken, userId, role } = await rotateRefreshToken(
      oldToken,
      ip,
      userAgent
    );
    const accessToken = generateAccessToken({ id: userId, role: role });

    setAuthCookie(response, refreshToken);

    return response.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller logoutController
 * @description Logs out the current user by revoking refresh token(s).
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response message
 */
export const logoutController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const rawToken = request.cookies.refreshToken || request.body.refreshToken;
    if (!rawToken) throw new HttpError(400, "Refresh token missing");

    await revokeRefreshToken(rawToken);

    // Clear cookie
    clearAuthCookie(response);

    return response.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller logoutAllController
 * @description Logs out user from all devices by revoking all tokens.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response message
 */
export const logoutAllController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const userId = (request as AuthenticationRequest).user?.id;
    if (!userId) {
      throw new HttpError(401, "Not authenticated");
    }
    await revokeAllUserRefreshTokens(userId);
    response.clearCookie("refreshToken");

    return response.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
    return;
  }
};
