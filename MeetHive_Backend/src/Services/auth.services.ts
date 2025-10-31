/**
 * @module src/Services/auth.service.ts
 * @description Service layer for authentication-related operations.
 */
import prisma from "../config/prisma.js";
import { RefreshToken, User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../Utils/passwordHash.js";
import {
  generateToken,
  hashToken,
  validateExistingToken,
} from "../Utils/refreshTokens.js";
import { UserData } from "../types/user.types.js";
import HttpError from "../Utils/HttpError.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../Utils/emails.js";

const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
const VERIFICATION_TOKEN_EXPIRES_IN = Number(
  process.env.VERIFICATION_TOKEN_EXPIRES_AT
);
const RESET_PASSWORD_TOKEN_EXPIRES_IN = Number(
  process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN
);

/**
 * @function  registerUser
 * @description Registers a new user in the system and sends their verification token
 * @param {Object} data - An object containing user details.
 * @returns {Promise<Object>} Success message and status.
 */
const registerUser = async (data: UserData): Promise<object> => {
  const { name, email, password, avatarUrl } = data;

  // Check if email for registration already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) {
    const error = new HttpError(409, "Email already in use");
    throw error;
  }

  //hashes password to be stored in database
  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      avatarUrl: avatarUrl ?? null,
    },
  });

  const verificationToken = generateToken(32);
  const hashedToken = hashToken(verificationToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_IN * 1000);

  await prisma.verificationToken.create({
    data: {
      hashedToken,
      userId: newUser.id,
      expiresAt,
    },
  });

  await sendVerificationEmail(newUser.email, verificationToken);
  return {
    success: true,
    message:
      "Registration successful, please verify your email using the link sent to your email",
  };
};

/**
 * @function verifyUserEmail
 * @description verifies a user's email using a verification token
 * @param {string} token - the verification token sent to user's email
 * @returns {Promise<Object>} success message and status
 * @throws Will throw an error if the token is invalid or expired.
 */
const verifyUserEmail = async (token: string): Promise<object> => {
  const hashedToken = hashToken(token);
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { hashedToken },
    include: { user: true },
  });
  if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
    throw new HttpError(400, "Invalid or expired verification token");
  }
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: tokenRecord.userId },
        data: { isEmailVerified: true },
      });
      await transaction.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      });
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.log("Error verifying email:", error);
    throw new HttpError(500, "Error verifying email");
  }
};

/**
 * @function initiatePasswordReset
 * @description initiates the password reset process by sending a reset email
 * @param {string} email - the email of the user requesting password reset
 * @returns {Promise<object>} success message and status
 * @throws Will throw an error if the user with the provided email does not exist.
 */
const initiateResetPassword = async (email: string): Promise<object> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLocaleLowerCase() },
  });
  if (!user) {
    throw new HttpError(404, "User with this email does not exist");
  }
  const resetToken = generateToken(32);
  const hashedToken = hashToken(resetToken);
  const expiresAt = new Date(
    Date.now() + RESET_PASSWORD_TOKEN_EXPIRES_IN * 1000
  );
  await prisma.resetToken.create({
    data: {
      hashedToken,
      userId: user.id,
      expiresAt,
    },
  });
  await sendResetPasswordEmail(user.email, resetToken);
  return {
    success: true,
    message: "Password reset email sent successfully, please check your inbox",
  };
};

/**
 * @function resetPassword
 * @description resets a user's password using a valid reset token
 * @param {string} token - the reset token sent to user's email
 * @param {string} newPassword - the new password to set
 * @returns {Promise<Object>} success message and status
 * @throws Will throw an error if the token is invalid or expired.
 */
const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const hashedToken = hashToken(token);
    const tokenRecord = await prisma.resetToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });
    if (
      !tokenRecord ||
      tokenRecord.used ||
      new Date() > tokenRecord.expiresAt
    ) {
      throw new HttpError(400, "Invalid or expired reset token");
    }
    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.$transaction(async (transaction) => {
      // Atomically mark the reset token as used only if it hasn't been used yet.
      const updated = await transaction.resetToken.updateMany({
        where: { id: tokenRecord.id, used: false },
        data: { used: true },
      });
      if (updated.count === 0) {
        throw new HttpError(400, "Invalid or expired reset token");
      }
      await transaction.user.update({
        where: { id: tokenRecord.userId },
        data: { hashedPassword: hashedNewPassword },
      });
    });
    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.log("Error resetting password:", error);
    throw new HttpError(500, "An error occurred while resetting the password");
  }
};

/**
 * @function loginUser
 * @description Authenticates a user with email and password.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} The authenticated user, message and success status.
 * @throws Will throw an error if authentication fails.
 */
const loginUser = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  data: Omit<User, "hashedPassword">;
}> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLocaleLowerCase() },
  });
  if (!user) {
    const error = new HttpError(404, "Invalid email or password");
    throw error;
  }
  if (!(await verifyPassword(user.hashedPassword, password))) {
    const error = new HttpError(401, "Invalid email or password");
    throw error;
  }
  if (!user.isEmailVerified) {
    const error = new HttpError(
      403,
      "Please verify your email before logging in"
    );
    throw error;
  }
  const { hashedPassword: _password, ...safeUser } = { ...user };
  return {
    success: true,
    message: "Login successful",
    data: safeUser,
  };
};

/**
 * @function createRefreshToken
 * @description Creates a new refresh token for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} [ip] - Optional IP address of the user.
 * @param {string} [userAgent] - Optional user agent string of the user.
 * @returns {Promise<{refreshToken: string}>} The raw refresh token.
 */
const createRefreshToken = async (
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<{ db: RefreshToken; refreshToken: string }> => {
  const refreshToken = generateToken(64);
  const hashed = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);

  const db = await prisma.refreshToken.create({
    data: {
      userId,
      hashedToken: hashed,
      expiresAt,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
  return { db, refreshToken };
};

/**
 * @function rotateRefreshToken
 * @description Rotates an existing refresh token by revoking the old one and creating a new one.
 * @param {string} oldToken - The old refresh token to be rotated.
 * @param {string} [ip] - Optional IP address of the user.
 * @param {string} [userAgent] - Optional user agent string of the user.
 * @returns {Promise<{success: boolean; message: string; data:{db: RefreshToken; refreshToken: string; userId: string; role: string}}>} -
 * The new refresh token and associated data.
 * @throws Will throw an error if the old token is invalid or expired.
 */
const rotateRefreshToken = async (
  oldToken: string,
  ip?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    db: RefreshToken;
    refreshToken: string;
    userId: string;
    role: string;
  };
}> => {
  const hashedOldToken = hashToken(oldToken);
  const existingToken = await validateExistingToken(hashedOldToken);
  const { user } = existingToken;
  const newToken = generateToken(64);
  const hashedNewToken = hashToken(newToken);
  try {
    const { db, refreshToken, userId, role } = await prisma.$transaction(
      async (transaction) => {
        await transaction.refreshToken.update({
          where: { id: existingToken.id },
          data: { revoked: true, replacedBy: hashedNewToken },
        });

        const { db, refreshToken } = await createRefreshToken(
          existingToken.userId,
          ip,
          userAgent
        );

        return {
          db,
          refreshToken,
          userId: existingToken.userId,
          role: user.role,
        };
      }
    );
    return {
      success: true,
      message: "token refreshed successfully",
      data: {
        db,
        refreshToken,
        userId,
        role,
      },
    };
  } catch (error) {
    console.log("Error rotating token:", error);
    throw new HttpError(500, "Error creating new refresh token");
  }
};

/**
 * @function revokeRefreshToken
 * @description Revokes a refresh token by its raw value.
 * @param {string} rawToken - The raw refresh token to be revoked.
 * @returns {Promise<object>} Success message and status.
 */
const revokeRefreshToken = async (rawToken: string): Promise<object> => {
  const hashedToken = await hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { hashedToken, revoked: false },
    data: { revoked: true },
  });
  return {
    success: true,
    message: "Logged out successfully",
  };
};

/**
 * @function revokeAllUserRefreshTokens
 * @description Revokes all active refresh tokens for a specific user.
 * @param {string} userId - The ID of the user whose tokens are to be revoked.
 * @returns {Promise<object>} Success message and status.
 */
const revokeAllUserRefreshTokens = async (userId: string): Promise<object> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
  return {
    success: true,
    message: "Logged out from all devices successfully",
  };
};

export {
  registerUser,
  verifyUserEmail,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  initiateResetPassword,
  resetPassword,
};
