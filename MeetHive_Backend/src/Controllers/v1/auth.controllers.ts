/**
 * @module src/Controllers/authController.ts
 * @description Controller layer for handling authentication-related HTTP requests.
 */

import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  verifyUserEmail,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  initiateResetPassword,
  resetPassword,
} from "../../Services/auth.services.js";
import { generateAccessToken } from "../../Utils/jwt.js";
import { setAuthCookie, clearAuthCookie } from "../../Utils/cookies.js";
import { AuthenticationRequest } from "../../types/user.types.js";
import HttpError from "../../Utils/httpError.js";

/**
 * @controller registerController
 * @description Registers a new user and sends their verification token.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with user data and tokens
 */
const registerController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(request.body);

    return response.status(201).json({ user });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller verifyEmailController
 * @description Verifies the registered user email
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response with user data and tokens
 */
const verifyEmailController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const token = await verifyUserEmail(request.body.token);

    return response.status(201).json({ token });
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
const loginController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = request.body;
    const user = await loginUser(email, password);

    const ip = request.ip;
    const userAgent = request.get("user-agent");

    const { refreshToken } = await createRefreshToken(
      user.data.id,
      ip,
      userAgent
    );
    const accessToken = generateAccessToken(user.data);

    setAuthCookie(response, refreshToken);

    return response.status(200).json({
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
const refreshController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const oldToken = request.cookies.refreshToken || request.body.refreshToken;
    if (!oldToken) throw new HttpError(401, "Refresh token missing");

    const ip = request.ip;
    const userAgent = request.get("user-agent");

    const token = await rotateRefreshToken(oldToken, ip, userAgent);
    const accessToken = generateAccessToken({
      id: token.data.userId,
      role: token.data.role,
    });

    setAuthCookie(response, token.data.refreshToken);

    return response.status(200).json({
      success: token.success,
      message: token.message,
      accessToken,
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller initiatePasswordResetController
 * @description Initiates the password reset process by sending a reset email.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response message
 */
const initiatePasswordResetController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { email } = request.body;
    const initiatedRequest = await initiateResetPassword(email);
    return response.status(200).json({
      initiatedRequest,
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller resetPasswordController
 * @description Resets the user's password using a valid reset token.
 * @param {Request} request - Express request object
 * @param {Response} response - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} JSON response message
 */
const resetPasswordController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = request.body;
    const result = await resetPassword(token, newPassword);
    return response.status(200).json({
      result,
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
const logoutController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const rawToken = request.cookies.refreshToken || request.body.refreshToken;
    if (!rawToken) throw new HttpError(400, "Refresh token missing");

    const result = await revokeRefreshToken(rawToken);

    // Clear cookie
    clearAuthCookie(response);

    return response.status(200).json({
      result,
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
const logoutAllController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const userId = (request as AuthenticationRequest).user?.id;
    if (!userId) {
      throw new HttpError(401, "Not authenticated");
    }
    const result = await revokeAllUserRefreshTokens(userId);
    response.clearCookie("refreshToken");

    return response.status(200).json({
      result,
    });
  } catch (error) {
    next(error);
    return;
  }
};

export {
  registerController,
  verifyEmailController,
  loginController,
  refreshController,
  logoutController,
  logoutAllController,
  initiatePasswordResetController,
  resetPasswordController,
};
