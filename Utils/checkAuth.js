import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import { toMilliseconds } from "./toMilliseconds.js";

export default async (req, res, next) => {
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
            const accessToken = jwt.sign({ _id: foundUser._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
            //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
            res.cookie('accessToken', accessToken, { maxAge: toMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });
            req.userId = foundUser._id;

            // Refresh token.
            const refreshToken = jwt.sign({ _id: foundUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
            //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
            res.cookie('refreshToken', refreshToken, { maxAge: toMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });

            foundUser.jwtRefreshToken = refreshToken;
            await foundUser.save();

            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ errorMessage: "Invalid refresh token" });
        }
    }
};