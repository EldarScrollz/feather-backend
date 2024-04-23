import { toMilliseconds } from "../Utils/toMilliseconds.js";

export const accessTokenExpiration = "5m";
export const refreshTokenExpiration = "30d";

//! (secure: true, sameSite: 'none') shouldn't be included in the real project.
export const accessTokenCookieOptions = { maxAge: toMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' };
//! (secure: true, sameSite: 'none') shouldn't be included in the real project.
export const refreshTokenCookieOptions = { maxAge: toMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' };

// ACCESS_TOKEN_EXPIRATION=5m
// REFRESH_TOKEN_EXPIRATION=30d