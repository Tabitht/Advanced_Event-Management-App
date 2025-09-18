/**
 * @module src/Utils/jwt
 * @description Utility functions for generating and verifying JSON Web Tokens (JWT).
 */
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const ACCESS_TOKEN_EXPIRES_IN = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);

/**
 * @function generateAccessToken
 * @description Generates a JWT for the given payload.
 * @param {object} payload - The payload to be included in the JWT.
 * @returns {string} The generated JWT.
 */
const generateAccessToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * @function verifyAccessToken
 * @description Verifies a JWT and returns the decoded payload.
 * @param {string} token - The JWT to be verified.
 * @returns {object|string} The decoded payload if the token is valid.
 * @throws Will throw an error if the token is missing or invalid.
 */
const verifyAccessToken = (token: string): object | string => {
  return jwt.verify(token, JWT_SECRET);
};

export { generateAccessToken, verifyAccessToken };
