import mongoose from "mongoose";


//todo: put the same limits as in the validation.

//todo CREATE LIMITS OBJECT LIKE: 'productLimits' IN 'SELLER'.

const CommentSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true },
        commentParentId: { type: mongoose.Schema.Types.ObjectId, default: null },
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        repliesCount: { type: Number, default: 0 },
        isEdited: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    });

export const CommentModel = mongoose.model("comments", CommentSchema);