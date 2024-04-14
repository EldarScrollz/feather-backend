import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        text: { type: String, required: true },
        tags: { type: [{ type: String }], default: [] },
        viewsCount: { type: Number, default: 0 },
        heartsCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        postImg: String,
    },
    {
        timestamps: true,
    });

export default mongoose.model("posts", PostSchema);