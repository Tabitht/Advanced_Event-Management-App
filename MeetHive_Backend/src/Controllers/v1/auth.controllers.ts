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
  revokeRawRefreshToken,
  revokeAllUserRefreshTokens,
  signAccessToken,
} from "../../Services/auth.services.js";
import ENV from "../../config/env.js";
import { AuthenticationRequest } from "../../types/user.types.js";
import HttpError from "../../Utils/HttpError.js";

/**
 * @controller registerController
 * @description Registers a new user, generates access + refresh tokens, and sends response.
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
    const accessToken = signAccessToken(user);

    // Set refresh token as HttpOnly cookie
    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.status(201).json({
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
    const accessToken = signAccessToken(user);

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.status(200).json({
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

    const { refreshToken, userId } = await rotateRefreshToken(
      oldToken,
      ip,
      userAgent
    );
    const accessToken = signAccessToken({ id: userId, role: "USER" });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.status(200).json({
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
 */
export const logoutController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const rawToken = request.cookies.refreshToken || request.body.refreshToken;
    if (!rawToken) throw new HttpError(400, "Refresh token missing");

    await revokeRawRefreshToken(rawToken);

    // Clear cookie
    response.clearCookie("refreshToken", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @controller logoutAllController
 * @description Logs out user from all devices by revoking all tokens.
 */
export const logoutAllController = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const userId = (request as AuthenticationRequest).user?.id;
    if (!userId) throw new HttpError(401, "Not authenticated");

    await revokeAllUserRefreshTokens(userId);
    response.clearCookie("refreshToken");

    return response
      .status(200)
      .json({ message: "Logged out from all devices" });
  } catch (error) {
    next(error);
    return;
  }
};
