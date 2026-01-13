import mongoose, { Schema, Document } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IUser } from "./User.js";
import type { IMessage } from "./Message.js";

export interface IRoom extends Document {
    type: "direct" | "group";
    name?: string;
    isPrivate: boolean;
    participants: PopulatedDoc<IUser>[];
    lastMessage?: PopulatedDoc<IMessage>;
    createdAt: Date;
    updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },
        name: {
            type: String,
            trim: true,
        },
        isPrivate: {
            type: Boolean,
            default: true,
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        id: true,
        toJSON: {
            virtuals: true,
        },
    },
);

export default mongoose.model<IRoom>("Room", roomSchema);
