/**
 * Utility functions for hashing and verifying passwords using bcrypt.
 * @module src/Utils/hash.ts
 */

import argon2 from "argon2";

/**
 * @function hashPassword
 * @description Hashes a plain text password using argon2.
 * @param {string} password - The plain text password to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

/**
 * @function verifyPassword
 * @description Verifies a plain text password against a hashed password.
 * @param {string}hashedPassword - The hashed password to compare against.
 * @param {string}plainPassword - The plain text password to verify.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, plainPassword);
};

export { hashPassword, verifyPassword };
