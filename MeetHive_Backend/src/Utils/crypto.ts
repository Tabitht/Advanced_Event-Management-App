/**
 * @module src/Utils/crypto
 * @description Utility functions for generating secure tokens.
 */
import crypto from "crypto";

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

export { generateToken, hashToken };
