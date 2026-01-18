import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    id: string;
    username: string;
    password: string;
    displayName?: string;
    avatarUrl?: string;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        displayName: {
            type: String,
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) {
                const { password: _password, _id, ...user } = ret;
                user.id = `user_${_id}`;

                return user;
            },
        },
    },
);

import { hashPassword } from "../utils/password.js";

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    if (!this.password) {
        throw new Error(
            "Password not found on user document. Did you use .select('+password')?",
        );
    }

    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
