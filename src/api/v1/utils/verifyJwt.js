
import * as jwtConfig from "../../../configs/jwtConfig.js";

import jwt from "jsonwebtoken";


export const verifyJwt = async (req, res, next) => {
    const { accessToken: cookieAccessToken } = req.cookies;

    // If 'cookieAccessToken' is valid then we allow to continue.
    if (cookieAccessToken) {
        try {
            const decodedAccessToken = jwt.verify(cookieAccessToken, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decodedAccessToken._id;

            next();
        }
        catch (error) { return res.status(403).json({ errorMessage: "Invalid access token." }); }
    }
    // Else if 'cookieAccessToken' is INVALID but 'cookieRefreshToken' is VALID then we send a new pair of access and refresh tokens.
    else {
        try {
            const { refreshToken: cookieRefreshToken } = req.cookies;
            if (!cookieRefreshToken) { return res.status(403).json({ errorMessage: "Refresh token is empty." }); }

            const decodedRefreshToken = jwt.verify(cookieRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            req.userId = decodedRefreshToken._id;

            const accessToken = jwt.sign({ _id: decodedRefreshToken._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
            res.cookie('accessToken', accessToken, jwtConfig.accessTokenCookieOptions);

            const refreshToken = jwt.sign({ _id: decodedRefreshToken._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
            res.cookie('refreshToken', refreshToken, jwtConfig.refreshTokenCookieOptions);

            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ errorMessage: "Invalid refresh token." });
        }
    }
};