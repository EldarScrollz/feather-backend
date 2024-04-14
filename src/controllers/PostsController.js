import PostModel from "../models/PostModel.js";
import CommentModel from "../models/CommentModel.js";
import HeartModel from "../models/HeartModel.js";
import fs from "fs";

export const createPost = async (req, res) => {
    try {
        const newPost = new PostModel(
            {
                title: req.body.title,
                text: req.body.text,
                tags: req.body.tags,
                user: req.userId,
                postImg: req.body.postImg,
            });

        await newPost.save();

        res.status(201).json(newPost);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not create the new post" });
    }
};



export const getAllPosts = async (req, res) => {
    try {
        let sortQuery = {};

        switch (req.query.sortBy) {
            case "new posts":
                sortQuery = { createdAt: -1 };
                break;
            case "old posts":
                sortQuery = { createdAt: 1 };
                break;
            case "ascending hearts":
                sortQuery = { heartsCount: 1 };
                break;
            case "descending hearts":
                sortQuery = { heartsCount: -1 };
                break;
            case "ascending views":
                sortQuery = { viewsCount: 1 };
                break;
            case "descending views":
                sortQuery = { viewsCount: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
                break;
        }
        
        const allPosts = await PostModel.find({}).sort(sortQuery).populate("user").exec();

        // Remove "passwordHash" from JSON
        allPosts.forEach((e) => {
            if (!e.user) return res.status(404).json({ errorMessage: "User not found" });
            e.user.passwordHash = undefined;
        });

        res.json(allPosts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get all posts" });
    }
};



export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const postFoundById = await PostModel.findOneAndUpdate(
            { _id: postId, },
            { $inc: { viewsCount: 1 }, },
            { returnDocument: "after", },
        ).populate("user").exec();

        if (!postFoundById) { return res.status(404).json({ errorMessage: "Post not found" }); }

        res.json(postFoundById);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get all posts" });
    }
};



export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Delete the post
        const removedPost = await PostModel.findOneAndDelete({ _id: postId });
        if (!removedPost) { return res.status(404).json({ errorMessage: "Post not found" }); }

        if (removedPost.postImg !== process.env.NO_IMG) {
            fs.unlink(`src/${removedPost.postImg}`, (error => {
                if (error) {
                    console.error("Could not delete posts's image", error);
                    return res.status(500).json({ errorMessage: "Could not delete posts's image" });
                }
            }));
        }

        // Delete comments and hearts associated with the post
        await CommentModel.deleteMany({ postId: postId });
        await HeartModel.deleteMany({ postId: postId });

        res.json({ message: "Post has been removed" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not delete the post" });
    }
};



export const updatePost = async (req, res) => {
    try {
        const updatedPost = await PostModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                title: req.body.title,
                text: req.body.text,
                tags: req.body.tags,
                user: req.userId, // We've put id of the user in the "userId" in "verifyJwt.js"
                postImg: req.body.postImg,
                commentsCount: req.body.commentsCount,
            }
        );
        if (!updatedPost) { return res.status(404).json({ errorMessage: "Post not found" }); }

        // Delete the old post img
        if (req.query.oldPostImg && req.query.oldPostImg !== process.env.NO_IMG) {
            fs.unlink(`src/${req.query.oldPostImg}`, (error => {
                if (error) {
                    console.error("Could not delete old posts's image", error);
                    return res.status(500).json({ errorMessage: "Could not delete old posts's image" });
                }
            }));
        }

        res.json({ message: "Post has been updated" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not update the post" });
    }
};



export const getTopTags = async (req, res) => {
    try {
        const newPostsWithMostHearts = await PostModel.find().sort({ "hearts.count": -1, createdAt: -1 }).limit(5).exec();
        const tagsFromTopPosts = [...new Set(newPostsWithMostHearts.map(e => e.tags).flat())];

        res.json(tagsFromTopPosts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get top tags" });
    }
};