import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    avatar?: string;
    isBlocked: boolean;
    isEmailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

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
            unique: true,
            lowercase: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        password: {
            type: String,
            required: true,
        },
        avatar: String,
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: Date,
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
