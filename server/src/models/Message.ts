import mongoose, { Schema, Document } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IConversation } from "./Conversation.js";
import type { IUser } from "./User.js";

export interface IMessage extends Document {
    id: string;
    conversation: PopulatedDoc<IConversation>;
    sender: PopulatedDoc<IUser>;
    content: string;
    type: "text" | "image";
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "image"],
            default: "text",
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false,
        id: true,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) {
                const { _id, ...msg } = ret;
                msg.id = `msg_${_id}`;

                return msg;
            },
        },
    },
);

export default mongoose.model<IMessage>("Message", messageSchema);
