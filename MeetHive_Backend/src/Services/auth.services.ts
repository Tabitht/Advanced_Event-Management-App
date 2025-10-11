/**
 * @module src/Services/auth.service.ts
 * @description Service layer for authentication-related operations.
 */
import prisma from "../config/prisma.js";
import { RefreshToken, User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../Utils/passwordHash.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  validateExistingToken,
} from "../Utils/refreshTokens.js";
import { UserData } from "../types/user.types.js";
import HttpError from "../Utils/HttpError.js";

const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
//const RESET_PASSWORD_TOKEN_EXPIRES_IN = Number(
//process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN
//);

/**
 * @function  registerUser
 * @description Registers a new user in the system.
 * @param {Object} data - An object containing user details.
 * @returns {Promise<Object>} The newly created user.
 */
const registerUser = async (
  data: UserData
): Promise<Omit<User, "hashedPassword">> => {
  const { name, email, password, avatarUrl, bio } = data;

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
      bio: bio ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
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
  const refreshToken = generateRefreshToken(64);
  const hashed = await hashRefreshToken(refreshToken);
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
  const hashedOldToken = hashRefreshToken(oldToken);
  const existingToken = await validateExistingToken(hashedOldToken);
  const { user } = existingToken;
  const newToken = generateRefreshToken(64);
  const hashedNewToken = hashRefreshToken(newToken);

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
  const hashedToken = await hashRefreshToken(rawToken);
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
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
