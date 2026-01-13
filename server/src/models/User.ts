import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
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
        toJSON: { virtuals: true },
    },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
