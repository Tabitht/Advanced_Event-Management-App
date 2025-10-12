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
import { sendVerificationEmail } from "../Utils/emails.js";

const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
const VERIFICATION_TOKEN_EXPIRES_IN = Number(
  process.env.VERIFICATION_TOKEN_EXPIRES_AT
);
//const RESET_PASSWORD_TOKEN_EXPIRES_IN = Number(
//process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN
//);

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
};

/**
 * @function loginUser
 * @description Authenticates a user with email and password.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} The authenticated user.
 * @throws Will throw an error if authentication fails.
 */
const loginUser = async (
  email: string,
  password: string
): Promise<Omit<User, "hashedPassword">> => {
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
  return safeUser;
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
 * @returns {Promise<{db: Object, refreshToken: string, userId: string}>} The new token data and user ID.
 * @throws Will throw an error if the old token is invalid or expired.
 */
const rotateRefreshToken = async (
  oldToken: string,
  ip?: string,
  userAgent?: string
): Promise<{
  db: RefreshToken;
  refreshToken: string;
  userId: string;
  role: string;
}> => {
  const hashedOldToken = hashToken(oldToken);
  const existingToken = await validateExistingToken(hashedOldToken);
  const { user } = existingToken;
  const newToken = generateToken(64);
  const hashedNewToken = hashToken(newToken);

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

  return { db, refreshToken, userId, role };
};

/**
 * @function revokeRefreshToken
 * @description Revokes a refresh token by its raw value.
 * @param {string} rawToken - The raw refresh token to be revoked.
 */
const revokeRefreshToken = async (rawToken: string) => {
  const hashedToken = await hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { hashedToken, revoked: false },
    data: { revoked: true },
  });
};

/**
 * @function revokeAllUserRefreshTokens
 * @description Revokes all active refresh tokens for a specific user.
 * @param {string} userId - The ID of the user whose tokens are to be revoked.
 */
const revokeAllUserRefreshTokens = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

export {
  registerUser,
  verifyUserEmail,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
