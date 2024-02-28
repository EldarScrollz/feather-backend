import HeartModel from "../models/HeartModel.js";
import PostModel from "../models/PostModel.js";

export const getAllHearts = async (req, res) => {
    try {
        const allHearts = await HeartModel.find();
        res.json(allHearts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get all hearts" });
    }
};



export const getHeartByPostId = async (req, res) => {
    try {
        const foundHearts = await HeartModel.find({ postId: req.params.postId });
        res.json(foundHearts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get all posts" });
    }
};



export const hasUserHeartedPost = async (req, res) => {
    try {
        const foundHeart = await HeartModel.findOne({ postId: req.params.postId, user: req.params.userId });
        res.json(foundHeart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not check if user has already hearted the post" });
    }
};



export const createHeart = async (req, res) => {
    try {
        //Check if post exists
        const postCheck = await PostModel.findById({ _id: req.params.postId });
        if (!postCheck) return res.status(404).json({ errorMessage: "Post not found" });

        // Check if the heart is already on the post
        const thePost = await HeartModel.findOne({ postId: req.params.postId });
        if (thePost && thePost.user.toString() === req.userId) { return res.status(409).json({ errorMessage: "The heart already exists on the post" }); }

        const newHeart = new HeartModel(
            {
                postId: req.params.postId,
                user: req.userId,
            });

        await newHeart.save();

        //Increase heartsCount on the post
        await PostModel.findOneAndUpdate({ _id: req.params.postId }, { $inc: { heartsCount: 1 } });

        res.status(201).json(newHeart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not create the heart" });
    }
};



export const deleteByHeartIdAndPostId = async (req, res) => {
    try {
        const foundItem = await HeartModel.findOneAndDelete({ postId: req.params.postId, user: req.params.userId });
        if (!foundItem) return res.status(404).json({ errorMessage: "Could not delete the heart, heart was not found" });

        //Decrease heartsCount on the post
        await PostModel.findOneAndUpdate({ _id: req.params.postId }, { $inc: { heartsCount: -1 } });

        res.json({ message: "Heart has been removed" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not delete the heart" });
    }
};