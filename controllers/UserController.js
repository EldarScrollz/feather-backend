import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";

import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";
import CommentModel from "../models/CommentModel.js";
import HeartModel from "../models/HeartModel.js";
import { toMilliseconds } from "../Utils/toMilliseconds.js";

export const register = async (req, res) => {
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
        //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
        res.cookie("accessToken", accessToken, { maxAge: toMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });
        // Create refresh token
        const refreshToken = jwt.sign({ _id: newUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
        //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
        res.cookie("refreshToken", refreshToken, { maxAge: toMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });

        newUser.jwtRefreshToken = refreshToken;
        await newUser.save();

        // Copy everything except passwordHash from newUser document (no need to include passwordHash in the response)
        const { passwordHash, jwtRefreshToken, ...userData } = newUser._doc;

        // Return the document and JWT as one object
        res.status(201).json({ ...userData, accessToken });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not register" });
    }
};



export const login = async (req, res) => {
    try {
        // Find the user in the "users" collection by email and save him in "foundUser"
        const foundUser = await UserModel.findOne({ email: req.body.email });
        if (!foundUser) { return res.status(400).json({ errorMessage: "Incorrect username or password" }); }

        // Comparing password from request and passwordhash from foundUser
        const isPasswordValid = await bcrypt.compare(req.body.password, foundUser.passwordHash);
        if (!isPasswordValid) { return res.status(400).json({ errorMessage: "Incorrect username or password" }); }

        // Create access token
        const accessToken = jwt.sign({ _id: foundUser._id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
        //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
        res.cookie("accessToken", accessToken, { maxAge: toMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });
        // Create refresh token
        const refreshToken = jwt.sign({ _id: foundUser._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
        //! (secure: true, sameSite: 'none') shouldn't be included in the real project.
        res.cookie("refreshToken", refreshToken, { maxAge: toMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION), httpOnly: true, secure: true, sameSite: 'none' });

        foundUser.jwtRefreshToken = refreshToken;
        foundUser.save();

        // Copy everything except passwordHash from foundUser document (no need to include passwordHash in the response)
        const { passwordHash, jwtRefreshToken, ...userData } = foundUser._doc;

        // Return the document and JWT
        res.status(201).json({ ...userData/*, accessToken*/ });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not sign in" });
    }
};



export const logout = async (req, res) => {
    try {
        res.cookie("accessToken");
        res.clearCookie("accessToken");
        res.cookie("refreshToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not logout" });
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



export const editUserInfo = async (req, res) => {
    try {
        // Utility --------------------------------------------------------------------------------------
        const deleteOldAvatar = () => {
            if (foundUser.userAvatar !== process.env.NO_IMG && req.query.oldAvatar) {
                fs.unlink(`./${foundUser.userAvatar}`, (error => {
                    if (error) {
                        console.error("Could not delete user's avatar", error);
                        return res.status(500).json({ errorMessage: "Could not delete user's avatar" });
                    }
                }));
            }
        };
        //-----------------------------------------------------------------------------------------------



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

            deleteOldAvatar();

            return res.json(editedUser);
        }
        //---------------------------------------------


        // Includes changing the password --------------------------------------------------------------------------------------------------------
        const isPasswordValid = await bcrypt.compare(req.body.currentPassword, foundUser.passwordHash);
        if (!isPasswordValid) { return res.status(400).json({ errorMessage: "Incorrect password" }); }

        if (req.body.newPassword !== req.body.confirmNewPassword) { return res.status(400).json({ errorMessage: "Passwords do not match" }); }

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

        deleteOldAvatar();

        res.json(editedUser);
        //----------------------------------------------------------------------------------------------------------------------------------------
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not edit user's data" });
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

        const deletedUserPosts = await PostModel.deleteMany({ user: req.userId });
        if (!deletedUserPosts) { return res.status(500).json({ errorMessage: "Could not delete user's posts" }); }

        const deletedUserComments = await CommentModel.deleteMany({ user: req.userId });
        if (!deletedUserComments) { return res.status(500).json({ errorMessage: "Could not delete user's comments" }); }

        const deletedUserHearts = await HeartModel.deleteMany({ user: req.userId });
        if (!deletedUserHearts) { return res.status(500).json({ errorMessage: "Could not delete user's hearts" }); }

        if (foundUser.userAvatar && foundUser.userAvatar !== process.env.NO_IMG) {
            fs.unlink(`./${foundUser.userAvatar}`, (error => {
                if (error) {
                    console.error("Could not delete user's avatar", error);
                    return res.status(500).json({ errorMessage: "Could not delete user's avatar" });
                }
            }));
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "User has been completely deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not delete the user" });
    }
};