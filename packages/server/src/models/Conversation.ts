import mongoose, { Schema, Document } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IUser } from "./User.js";
import type { IMessage } from "./Message.js";

export interface IConversation extends Document {
    id: string;
    type: "direct" | "group";
    name?: string;
    isPrivate: boolean;
    participants: PopulatedDoc<IUser>[];
    admin?: PopulatedDoc<IUser>;
    lastMessage?: PopulatedDoc<IMessage>;
    createdAt: Date;
    updatedAt: Date;
    isAdmin(user?: IUser): boolean;
    isUserParticipant(userId: mongoose.Types.ObjectId | string): boolean;
}

const conversationSchema = new Schema<IConversation>(
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
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: function (this: IConversation) {
                return this.type === "group";
            },
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) {
                const { _id, ...conversation } = ret;
                conversation.id = `conv_${_id}`;

                return conversation;
            },
        },
    },
);

conversationSchema.methods.isAdmin = function (user?: IUser): boolean {
    return (
        !!user && this.admin && this.admin.toString() === user._id.toString()
    );
};

conversationSchema.methods.isUserParticipant = function (
    userId: mongoose.Types.ObjectId | string,
): boolean {
    return this.participants.some(
        (p: IUser | mongoose.Types.ObjectId) =>
            p.toString() === userId.toString(),
    );
};

export default mongoose.model<IConversation>(
    "Conversation",
    conversationSchema,
);
