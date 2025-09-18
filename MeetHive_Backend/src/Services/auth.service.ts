/**
 * @module src/Services/auth.service.ts
 * @description Service layer for authentication-related operations.
 */
import { PrismaClient } from "@prisma/client";
import { RefreshToken, User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../Utils/hash.js";
import { generateAccessToken } from "../Utils/jwt.js";
import { generateToken, hashToken } from "../Utils/crypto.js";
import HttpError from "../Utils/HttpError.js";

const prisma = new PrismaClient();

const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
//const RESET_PASSWORD_TOKEN_EXPIRES_IN = Number(
//process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN
//);

/**
 * @function  registerUser
 * @description Registers a new user in the system.
 * @param {Object} userData - An object containing user details.
 * @param {string} userData.name - The name of the user.
 * @param {string} userData.email - The email of the user.
 * @param {string} userData.password - The password of the user.
 * @param {string} [userData.avatarUrl] - Optional avatar URL of the user.
 * @param {string} [userData.bio] - Optional bio of the user.
 * @returns {Promise<Object>} The newly created user.
 */
const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<Omit<User, "password">> => {
  const { name, email, password, avatarUrl, bio } = userData;

  // Check if email for registration already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
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
      password: hashedPassword,
      avatarUrl: avatarUrl ?? null,
      bio: bio ?? null,
    },
  });

  //remove password from data to be returned
  const { password: _password, ...safeUser } = { ...newUser };
  return safeUser;
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
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new HttpError(404, "Invalid email or password");
    throw error;
  }
  if (!(await verifyPassword(user.password, password))) {
    const error = new HttpError(401, "Invalid email or password");
    throw error;
  }
  const { password: _password, ...safeUser } = { ...user };
  return safeUser;
};

/**
 * @function createRefreshToken
 * @description Creates a new refresh token for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} [ip] - Optional IP address of the user.
 * @param {string} [userAgent] - Optional user agent string of the user.
 * @returns {Promise<{db: Object, refreshToken: string}>} The database record and raw refresh token.
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
): Promise<{ db: object; refreshToken: string; userId: string }> => {
  const hashedOldToken = await hashToken(oldToken);
  const existingToken = await prisma.refreshToken.findFirst({
    where: { hashedToken: hashedOldToken },
  });
  if (
    !existingToken ||
    existingToken.expiresAt < new Date() ||
    existingToken.revoked
  ) {
    const error = new HttpError(401, "Invalid or expired refresh token");
    throw error;
  }
  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: { revoked: true },
  });

  const newTokenData = await createRefreshToken(
    existingToken.userId,
    ip,
    userAgent
  );
  await prisma.refreshToken.update({
    where: { id: newTokenData.db.id },
    data: { replacedBy: newTokenData.db.id },
  });
  return { ...newTokenData, userId: existingToken.userId };
};

/**
 * @function revokeHashedRefreshToken
 * @description Revokes a refresh token by its hashed value.
 * @param {string} hashedToken - The hashed refresh token to be revoked.
 */
const revokeHashedRefreshToken = async (hashedToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { hashedToken, revoked: false },
    data: { revoked: true },
  });
};

/**
 * @function revokeRawRefreshToken
 * @description Revokes a refresh token by its raw value.
 * @param {string} rawToken - The raw refresh token to be revoked.
 */
const revokeRawRefreshToken = async (rawToken: string) => {
  const hashedToken = await hashToken(rawToken);
  await revokeHashedRefreshToken(hashedToken);
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

/**
 * @function signAccessToken
 * @description Generates a JWT access token for a user.
 * @param {Object} user - An object containing user details.
 * @param {string} user.id - The ID of the user.
 * @param {string} user.role - The role of the user.
 * @returns {string} The generated JWT access token.
 */
const signAccessToken = (user: { id: string; role: string }): string => {
  return generateAccessToken({ userId: user.id, role: user.role });
};

export {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRawRefreshToken,
  revokeAllUserRefreshTokens,
  signAccessToken,
};
