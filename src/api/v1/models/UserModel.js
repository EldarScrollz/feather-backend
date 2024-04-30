import mongoose from "mongoose";



const UserSchema = new mongoose.Schema( // Create schema -> fill it with properties -> fill properties
    {                                   // with options if property is not optional.
        email: { type: String, required: true, unique: true, },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, unique: true, },
        jwtRefreshToken: { type: String, required: true },
        userAvatar: { type: String, default: process.env.NO_IMG }, // Optional
    },
    {
        timestamps: true, // Scheme should automatically create timestamps
    });

export const UserModel = mongoose.model("users", UserSchema);
// Now we create a model called "users" that is based on our schema
// we use export "default mongoose.model("users", UserSchema)" because:
//  "You can have one default export per file. You can give this any name you like".