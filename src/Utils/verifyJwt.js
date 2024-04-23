import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import * as jwtConfig from "../configs/jwtConfig.js";

export const verifyJwt = async (req, res, next) => {
    const { accessToken } = req.cookies;

    if (accessToken) {
        try {
            const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decodedAccessToken._id;

            next();
        }
        catch (error) {
            return res.status(403).json({ errorMessage: "Invalid access token" });
        }
    }
    else {
        try {
            const { refreshToken: cookieRefreshToken } = req.cookies;
            if (!cookieRefreshToken) { return res.status(403).json({ errorMessage: "Refresh token is empty" }); }

            jwt.verify(cookieRefreshToken, process.env.REFRESH_TOKEN_SECRET);

            const foundUser = await UserModel.findOne({ jwtRefreshToken: cookieRefreshToken });
            if (!foundUser) { return res.status(404).json({ errorMessage: "Could not find the user based on a refresh token" }); }

            // Access token.
            const accessToken = jwt.sign({ _id: foundUser._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: jwtConfig.accessTokenExpiration });
            res.cookie('accessToken', accessToken, jwtConfig.accessTokenCookieOptions);
            req.userId = foundUser._id;

            // Refresh token.
            const refreshToken = jwt.sign({ _id: foundUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: jwtConfig.refreshTokenExpiration });
            res.cookie('refreshToken', refreshToken, jwtConfig.refreshTokenCookieOptions);

            foundUser.jwtRefreshToken = refreshToken;
            await foundUser.save();

            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ errorMessage: "Invalid refresh token" });
        }
    }
};