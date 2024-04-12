import { toMilliseconds } from "../Utils/toMilliseconds.js";

//! (secure: true, sameSite: 'none') shouldn't be included in the real project.
export const accessTokenOptions = { maxAge: toMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' };
//! (secure: true, sameSite: 'none') shouldn't be included in the real project.
export const refreshTokenOptions = { maxAge: toMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' };