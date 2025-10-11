import { Response } from "express";

/**
 * @function setAuthCookie
 * @description sets refresh token as HttpOnly cookie
 * @param {Response} response - express response object
 * @param {string} refreshToken - the refresh token to set in the cookie
 */
const setAuthCookie = (response: Response, refreshToken: string) => {
  response.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/**
 * @function clearAuthCookie
 * @description clears the refresh token from cookie
 * @param {Response} response - express response object
 */
const clearAuthCookie = (response: Response) => {
  response.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};
export { setAuthCookie, clearAuthCookie };
