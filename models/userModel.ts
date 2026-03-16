import mongoose, { Schema, Document } from "mongoose";

// Interface representing a document in MongoDB, extending mongoose.Document
export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    avatar?: string;
    isBlocked: boolean;
    isEmailVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Schema definition for the User collection
const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Ensures no two users can have the same email
            lowercase: true,
            index: true, // Optimizes search performance by email
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Basic regex format validation
        },
        password: {
            type: String,
            required: true, // This stores the hashed password, never plain text
        },
        avatar: String, // Google profile picture URL or custom uploaded avatar
        isBlocked: {
            type: Boolean,
            default: false, // For admin moderation to ban users
        },
        isEmailVerified: {
            type: Boolean,
            default: false, // True for Google signups, or standard signups that clicked a verify link
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastLogin: Date,
    },
    // Setting timestamps: true automatically adds createdAt and updatedAt fields to the document
    { timestamps: true }
);

// Register and export the model
export default mongoose.model<IUser>("User", userSchema);
