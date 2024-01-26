import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import { postRouter } from "./routes/PostRouter.js";
import { userRouter } from "./routes/UserRouter.js";
import { commentRouter } from "./routes/CommentRouter.js";
import { heartRouter } from "./routes/HeartRouter.js";

import { configuredMulter } from "./multer.js";

// Connect to MongoDB.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("DATABASE CONNECTED 🗸"))
    .catch((error) => { console.warn("Database Error:", error); });

// Create express app.
const app = express();
// Teach express to read json.
app.use(express.json());
// Cors.
app.use(cors());
// Listen to the given port.
app.listen(process.env.PORT, (error) => { if (error) { return console.warn("Server Error:", error); } console.log("SERVER STARTED 🗸"); });


//===========================================================================
// Routes.
//===========================================================================
app.use("/auth", userRouter);
app.use("/posts", postRouter);
app.use("/hearts", heartRouter);
app.use("/comments", commentRouter);


//===========================================================================
// Multer.
//===========================================================================
configuredMulter(app);