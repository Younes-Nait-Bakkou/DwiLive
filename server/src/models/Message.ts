import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    id: string;
    roomId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    type: "text" | "image";
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },
        senderId: {
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
