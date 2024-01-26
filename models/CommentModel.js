import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true },
        commentParentId: { type: mongoose.Schema.Types.ObjectId, default: null },
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        repliesCount: {type: Number, default: 0},
        isEdited: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    });

export default mongoose.model("comments", CommentSchema);