import CommentModel from "../models/CommentModel.js";
import PostModel from "../models/PostModel.js";

export const getAllComments = async (req, res) =>
{
    try
    {
        const allComments = await CommentModel.find().populate("user").exec();
        res.json(allComments);
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get all comments" });
    }

};



export const getCommentsByPostId = async (req, res) =>
{
    try
    {
        const postId = req.params.id;

        const postComments = await CommentModel.find({ postId: postId }).populate("user").exec();
        postComments.forEach((e) => { e.user.passwordHash = undefined; });
        res.json(postComments);
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get comments by post id" });
    }
};



export const getReplies = async (req, res) =>
{
    try
    {
        const parentCommentId = req.params.id;
        const commentReplies = await CommentModel.find({ commentParentId: parentCommentId }).populate("user").exec();

        res.json(commentReplies);
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not get comment's replies" });
    }
};



export const createComment = async (req, res) =>
{
    try
    {
        const postOfComment = await PostModel.findOneAndUpdate(
            { _id: req.body.postId },
            { $inc: { commentsCount: 1 } }
        );
        if (!postOfComment) { return res.status(404).json({ errorMessage: "Post not found" }); }

        const newComment = new CommentModel(
            {
                postId: req.body.postId,
                commentParentId: req.body.commentParentId,
                text: req.body.text,
                user: req.userId,
            }
        );
        await newComment.save();

        // Inc main comment's repliesCount when adding a reply
        if (req.body.commentParentId) { await CommentModel.findOneAndUpdate({ _id: req.body.commentParentId }, { $inc: { repliesCount: 1 } }); }

        res.status(201).json(newComment);
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not create the comment" });
    }
};



export const updateComment = async (req, res) =>
{
    try
    {
        const commentId = req.params.id;

        await CommentModel.findOneAndUpdate({ _id: commentId }, { text: req.body.text, isEdited: true });

        res.json({ message: "Comment has been updated" });
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not update the comment" });
    }
};



export const deleteComment = async (req, res) =>
{
    try
    {
        // Utility --------------------------------------------------------------------------------------------------------
        const decreaseCommentsCount = async () =>
        {
            const updatedPost = await PostModel.findOneAndUpdate({ _id: req.body.postId }, { $inc: { commentsCount: -1 } });
            if (!updatedPost) { return res.status(404).json({ errorMessage: "Post not found" }); }
        };
        // ----------------------------------------------------------------------------------------------------------------

        const commentId = req.params.id;

        // If it is a main comment (delete all replies with it)
        if (req.body.commentParentId === null)
        {
            const removedComment = await CommentModel.findByIdAndDelete({ _id: commentId });
            if (!removedComment) { return res.status(404).json({ errorMessage: "Comment not found" }); }

            await CommentModel.deleteMany({ commentParentId: req.body._id });
            decreaseCommentsCount();

            res.json({ message: "Comment (and associated replies (if present)) have been removed" });
        }
        else // Delete a reply
        {
            const removedComment = await CommentModel.findByIdAndDelete({ _id: commentId });
            if (!removedComment) { return res.status(404).json({ errorMessage: "Comment not found" }); }
            decreaseCommentsCount();
            // Decrease repliesCount when deleting main comment's reply
            await CommentModel.findOneAndUpdate({ _id: req.body.commentParentId }, { $inc: { repliesCount: -1 } });

            res.json({ message: "Comment has been removed" });
        }
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ errorMessage: "Could not delete the comment" });
    }
};