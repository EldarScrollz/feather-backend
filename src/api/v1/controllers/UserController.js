import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";

import { UserModel } from "../models/UserModel.js";
import { PostModel } from "../models/PostModel.js";
import { CommentModel } from "../models/CommentModel.js";
import { HeartModel } from "../models/HeartModel.js";
import * as jwtConfig from "../../../configs/jwtConfig.js";

//todo: change '._doc' to '.toObject()'

export const signUp = async (req, res) => {
    try {
        // Throw error if email exists
        const isUserEmailAlreadyInDB = await UserModel.findOne({ email: req.body.email });
        if (isUserEmailAlreadyInDB) { return res.status(400).json({ errorMessage: "The email already exists" }); }

        // Throw error if name exists
        const isUserNameAlreadyInDB = await UserModel.findOne({ name: req.body.name });
        if (isUserNameAlreadyInDB) { return res.status(400).json({ errorMessage: "The name already exists" }); }

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = new UserModel({
            email: req.body.email,
            passwordHash: hashedPassword,
            name: req.body.name,
            jwtRefreshToken: "",
            userAvatar: req.body.userAvatar,
        });

        // Create JWT
        const accessToken = jwt.sign({ _id: newUser._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
        res.cookie("accessToken", accessToken, jwtConfig.accessTokenCookieOptions);
        // Create refresh token
        const refreshToken = jwt.sign({ _id: newUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
        res.cookie("refreshToken", refreshToken, jwtConfig.refreshTokenCookieOptions);

        newUser.jwtRefreshToken = refreshToken;
        await newUser.save();

        // Copy everything except passwordHash from newUser document (no need to include passwordHash in the response)
        const { passwordHash, jwtRefreshToken, ...userData } = newUser.toObject();

        // Return the document and JWT as one object
        res.status(201).json({ ...userData, accessToken });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not sign up." });
    }
};



export const signIn = async (req, res) => {
    try {
        // Find the user in the "users" collection by email and save him in "foundUser"
        const foundUser = await UserModel.findOne({ email: req.body.email });
        if (!foundUser) { return res.status(400).json({ errorMessage: "Incorrect username or password." }); }

        // Comparing password from request and passwordhash from foundUser
        const isPasswordValid = await bcrypt.compare(req.body.password, foundUser.passwordHash);
        if (!isPasswordValid) { return res.status(400).json({ errorMessage: "Incorrect username or password." }); }

        // Create access token
        const accessToken = jwt.sign({ _id: foundUser._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
        res.cookie("accessToken", accessToken, jwtConfig.accessTokenCookieOptions);
        // Create refresh token
        const refreshToken = jwt.sign({ _id: foundUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
        res.cookie("refreshToken", refreshToken, jwtConfig.refreshTokenCookieOptions);

        foundUser.jwtRefreshToken = refreshToken;
        foundUser.save();

        // Copy everything except passwordHash from foundUser document (no need to include passwordHash in the response)
        const { passwordHash, jwtRefreshToken, ...userData } = foundUser.toObject();

        // Return the document and JWT
        res.status(201).json({ ...userData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not sign in." });
    }
};



export const signOut = async (req, res) => {
    try {
        const { maxAge: maxAgeRefreshToken, ...clearAccessTokenOptions } = jwtConfig.accessTokenCookieOptions;
        res.clearCookie("accessToken", clearAccessTokenOptions);
        const { maxAge: maxAgeAccessToken, ...clearRefreshTokenOptions } = jwtConfig.refreshTokenCookieOptions;
        res.clearCookie("refreshToken", clearRefreshTokenOptions);

        res.json({ message: "Signed out successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not sign out." });
    }
};



export const getUserInfo = async (req, res) => {
    try {
        const foundUser = await UserModel.findById(req.userId);
        if (!foundUser) { return res.status(404).json({ errorMessage: "User not found" }); }

        // Copy everything except passwordHash from foundUser document (no need to include passwordHash in the response)
        const { passwordHash, ...userData } = foundUser._doc;

        // Return the document
        res.json({ ...userData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get the information about the user" });
    }
};



export const editUser = async (req, res) => {
    try {
        const foundUser = await UserModel.findById(req.userId);

        // No password change -------------------------
        if (!req.body.isChangePassword) {
            const editedUser = await UserModel.findOneAndUpdate(
                { _id: req.userId },
                {
                    email: req.body.email,
                    name: req.body.name,
                    userAvatar: req.body.userAvatar,
                },
                { new: true }
            );
            if (!editedUser) {
                return res.status(500).json({ errorMessage: "Could not edit the user." });
            }

            deleteOldAvatar(foundUser, req.body.oldAvatar);

            const { jwtRefreshToken, ...userData } = editedUser.toObject();

            return res.json(userData);
        }
        //---------------------------------------------


        // Includes changing the password --------------------------------------------------------------------------------------------------------
        const isPasswordValid = await bcrypt.compare(req.body.currentPassword, foundUser.passwordHash);
        if (!isPasswordValid) { return res.status(400).json({ errorMessage: "Incorrect password." }); }

        if (req.body.newPassword !== req.body.confirmNewPassword) { return res.status(400).json({ errorMessage: "Passwords do not match." }); }

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

        const editedUser = await UserModel.findOneAndUpdate(
            { _id: req.userId },
            {
                email: req.body.email,
                name: req.body.name,
                userAvatar: req.body.userAvatar,
                passwordHash: hashedPassword,
            },
            { new: true }
        );
        if (!editedUser) {
            return res.status(500).json({ errorMessage: "Could not edit the user." });
        }

        if (!deleteOldAvatar(foundUser, req.body.oldAvatar)) {
            return res.status(500).json({ errorMessage: "Could not delete user's avatar." });
        }

        const { jwtRefreshToken, ...userData } = editedUser.toObject();

        res.json(userData);
        //---------------------------------------------------------
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not edit user's data." });
    }
};



export const deleteUser = async (req, res) => {
    try {
        const foundUser = await UserModel.findOne({ _id: req.userId });
        if (!foundUser) { return res.status(404).json({ errorMessage: "Could not find the user" }); }

        const isPasswordValid = await bcrypt.compare(req.params.password, foundUser.passwordHash);
        if (!isPasswordValid) { return res.status(400).json({ errorMessage: "Incorrect password" }); }

        const deletedUser = await UserModel.findOneAndDelete({ _id: req.userId });
        if (!deletedUser) { return res.status(500).json({ errorMessage: "Could not delete the user" }); }

        const userPosts = await PostModel.find({ user: req.userId });
        const deletedUserPosts = await PostModel.deleteMany({ user: req.userId });
        if (!deletedUserPosts) { return res.status(500).json({ errorMessage: "Could not delete user's posts" }); }

        const deletedUserComments = await CommentModel.deleteMany({ user: req.userId });
        if (!deletedUserComments) { return res.status(500).json({ errorMessage: "Could not delete user's comments" }); }

        const deletedUserHearts = await HeartModel.deleteMany({ user: req.userId });
        if (!deletedUserHearts) { return res.status(500).json({ errorMessage: "Could not delete user's hearts" }); }

        // Delete avatar.
        if (foundUser.userAvatar && foundUser.userAvatar !== process.env.NO_IMG) {
            fs.unlink(`src/${foundUser.userAvatar}`, (error => {
                if (error) {
                    console.error("Could not delete user's avatar", error);
                    return res.status(500).json({ errorMessage: "Could not delete user's avatar" });
                }
            }));
        }

        // Delete posts' images
        userPosts.forEach((e) => {
            if (e.postImg !== process.env.NO_IMG) {
                fs.unlink(`src/${e.postImg}`, (error => {
                    if (error) {
                        console.error("Could not delete posts's image", error);
                        return res.status(500).json({ errorMessage: "Could not delete posts's image" });
                    }
                }));
            }
        });

        const { maxAge: maxAgeRefreshToken, ...clearAccessTokenOptions } = jwtConfig.accessTokenCookieOptions;
        res.clearCookie("accessToken", clearAccessTokenOptions);
        const { maxAge: maxAgeAccessToken, ...clearRefreshTokenOptions } = jwtConfig.refreshTokenCookieOptions;
        res.clearCookie("refreshToken", clearRefreshTokenOptions);

        res.json({ message: "User has been completely deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not delete the user" });
    }
};



//==================================================================================================================
// Utils
//==================================================================================================================
const deleteOldAvatar = (foundUser, oldAvatar) => {
    if (foundUser?.userAvatar !== process.env.NO_IMG && oldAvatar) {
        fs.unlink(`./${foundUser?.userAvatar}`, (error => {
            if (error) {
                console.error("Could not delete user's avatar.", error);
                return false;
            }
        }));
    }

    return true;
};