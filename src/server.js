// import dotenv from "dotenv";
// dotenv.config();
import 'dotenv/config'

import express from "express";
import { rateLimit } from "express-rate-limit";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { postsRouter } from "./routes/v1/PostsRouter.js";
import { userRouter } from "./routes/v1/UserRouter.js";
import { commentsRouter } from "./routes/v1/CommentsRouter.js";
import { heartsRouter } from "./routes/v1/HeartsRouter.js";

import { multerInit } from "./multer.js";

//todo: convert project to TypeScript.

const app = express(); // Create the app.
app.use(express.json());  // To read json.
app.use(cookieParser()); // To interact with cookies.
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL })); // To securely communicate with the front end.
app.use(helmet({ crossOriginResourcePolicy: false, })); // Helmet helps secure Express apps by setting HTTP response headers.

// Limit the request rate of all endpoints (to prevent request spamming).
const limiter = rateLimit({
    windowMs: 5000,
    limit: 100, // Max requests per windowMs.
    message: "Too many requests, please try again after 5 seconds." 
});
app.use(limiter); // Apply the rate limiting middleware.

// Connect to the database (MongoDB).
connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("--- Connected to MongoDB");
        app.listen(process.env.PORT, () => console.log(`--- Server is running on port: ${process.env.PORT}`));
    })
    .catch((error) => { console.error("Failed to connect to MongoDB", error); });


//==================================================================================================================
// Routers
//==================================================================================================================
app.use("/v1/user", userRouter);
app.use("/v1/posts", postsRouter);
app.use("/v1/hearts", heartsRouter);
app.use("/v1/comments", commentsRouter);


//==================================================================================================================
// Multer.
//==================================================================================================================
multerInit(app);