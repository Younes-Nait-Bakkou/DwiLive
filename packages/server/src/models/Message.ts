import mongoose, { Schema, Document } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IConversation } from "./Conversation.js";
import type { IUser } from "./User.js";
import type {
    UserJoinedMetadata,
    GroupRenamedMetadata,
    MemberAddedMetadata,
} from "@dwilive/shared";

export interface IMessage extends Document {
    id: string;
    conversation: PopulatedDoc<IConversation>;
    sender?: PopulatedDoc<IUser>;
    content: string;
    type: "text" | "image" | "system";
    metadata?: UserJoinedMetadata | GroupRenamedMetadata | MemberAddedMetadata;
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
            required: function () {
                return this.type !== "system";
            },
        },
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "image", "system"],
            default: "text",
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
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
