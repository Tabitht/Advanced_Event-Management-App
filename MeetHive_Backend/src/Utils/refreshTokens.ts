/**
 * @module src/Utils/crypto
 * @description Utility functions for generating secure tokens.
 */
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import HttpError from "./HttpError.js";

/**
 * @function generateToken
 * @description Generates a secure random token.
 * @param {number} length - The length of the token in bytes (default is 64).
 * @returns {string} A hexadecimal string representation of the token.
 */
const generateToken = (length: number = 64): string => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * @function hashToken
 * @description Hashes a token using SHA-256.
 * @param {string} token - The token to be hashed.
 * @returns {string} A hexadecimal string representation of the hashed token.
 */
const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * @function validateExistingToken
 * @description validates an existing refresh token in the database to make sure it is valid
 * @param {string} hashedToken - The token to validate
 * @returns {Object} the validated token object
 * @throws - throws an error if there is no token or token is revoked or expired
 */
const validateExistingToken = async (
  hashedToken: string
): Promise<
  Prisma.RefreshTokenGetPayload<{
    include: { user: { select: { role: true } } };
  }>
> => {
  const gracePeriod = 60;
  const token = await prisma.refreshToken.findUnique({
    where: { hashedToken },
    include: {
      user: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!token) {
    throw new HttpError(401, "Token not found");
  }
  if (token.revoked) {
    throw new HttpError(401, "Token already revoked");
  }
  if (new Date() > new Date(token.expiresAt.getTime() + gracePeriod)) {
    throw new HttpError(401, "Token expired");
  }

  const user = await prisma.user.findUnique({ where: { id: token.userId } });
  if (!user?.isEmailVerified) {
    throw new HttpError(403, "Account not verified");
  }
  return token;
};

export { generateToken, hashToken, validateExistingToken };
