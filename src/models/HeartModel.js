import mongoose from "mongoose";

const HeartSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    {
        timestamps: true,
    });

export default mongoose.model("hearts", HeartSchema);