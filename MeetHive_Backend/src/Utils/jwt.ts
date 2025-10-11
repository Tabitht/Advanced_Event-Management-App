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
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

/**
 * @function generateAccessToken
 * @description Generates a JWT access token for a user
 * @param {Object} user - The user object containing the id and role
 * @param {string} user.id - The user's unique ID
 * @param {string} user.role - The user's role.
 * @returns {string} The signed JWT token.
 */
const generateAccessToken = (user: { id: string; role: string }): string => {
  const payload = {
    sub: user.id,
    role: user.role,
  };
  const options: SignOptions = {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
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
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return decoded;
};

export { generateAccessToken, verifyAccessToken };
