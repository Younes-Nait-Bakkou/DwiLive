import type { RequestHandler } from "express";
import Conversation, { type IConversation } from "../models/Conversation.js";
import Message, { type IMessage } from "../models/Message.js";
import mongoose, { type QueryFilter } from "mongoose";
import {
    type CreateConversationRequest,
    type AddMemberRequest,
    type RemoveMemberRequest,
    type LeaveConversationRequest,
    type GetMessagesRequest,
} from "../schemas/conversation.schema.js";
import { log } from "node:console";

export const createConversation: RequestHandler<
    object,
    object,
    CreateConversationRequest["body"]
> = async (req, res) => {
    try {
        const { type, participants, name, isPrivate } = req.body;

        if (!req.user) return;

        if (type === "direct") {
            const otherUserId = new mongoose.Types.ObjectId(participants![0]);
            const myId = req.user._id;

            const conversationFilter: QueryFilter<IConversation> = {
                type: "direct",
                participants: { $all: [myId, otherUserId], $size: 2 },
            };

            // Check if direct conversation already exists
            let conversation = await Conversation.findOne(conversationFilter);

            if (conversation) {
                await conversation.populate("participants admin");
                return res.status(200).json(conversation);
            }

            conversation = await Conversation.create({
                type: "direct",
                participants: [myId, otherUserId],
                isPrivate: true,
            });

            await conversation.populate("participants admin");
            return res.status(201).json(conversation);
        }

        if (type === "group") {
            console.log(participants);
            const conversation = await Conversation.create({
                type: "group",
                name: name!,
                isPrivate: isPrivate || true,
                participants: [
                    req.user._id,
                    ...(participants || []).map(
                        (p) => new mongoose.Types.ObjectId(p),
                    ),
                ],
                admin: req.user._id,
            });

            await conversation.populate("participants admin");
            return res.status(201).json(conversation);
        }

        return res.status(400).json({ message: "Invalid conversation type" });
    } catch (error: unknown) {
        log(error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const getConversations: RequestHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log(req.user.id);
        const conversationFilter: QueryFilter<IConversation> = {
            participants: req.user?._id,
        };
        const conversations = await Conversation.find(conversationFilter)
            .populate("participants")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.json(conversations);
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const addMember: RequestHandler<
    AddMemberRequest["params"],
    object,
    AddMemberRequest["body"]
> = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.type !== "group") {
            return res
                .status(400)
                .json({ message: "Cannot add members to a direct chat" });
        }

        if (!conversation.isAdmin(req.user)) {
            return res
                .status(403)
                .json({ message: "Only the admin can add members" });
        }

        if (conversation.isUserParticipant(userId)) {
            return res.status(400).json({ message: "User already in conversation" });
        }

        conversation.participants.push(new mongoose.Types.ObjectId(userId));
        await conversation.save();

        return res.json({ message: "User added successfully" });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const removeMember: RequestHandler<
    RemoveMemberRequest["params"]
> = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (conversation.type === "direct") {
            return res
                .status(400)
                .json({ message: "Cannot remove members from a direct chat" });
        }

        if (!conversation.isAdmin(req.user)) {
            return res
                .status(403)
                .json({ message: "Only the admin can remove members" });
        }

        if (!conversation.isUserParticipant(userId)) {
            return res
                .status(400)
                .json({ message: "Member is not a participant of this conversation" });
        }

        if (userId.toString() == req.user?.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot kick yourself out of the conversation" });
        }

        await conversation.save();
        return res.json({ message: "Member removed successfully" });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const getMessages: RequestHandler<
    GetMessagesRequest["params"],
    object,
    object,
    GetMessagesRequest["query"]
> = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = "50", before } = req.query;

        const conversationFilter: QueryFilter<IConversation> = {
            _id: conversationId,
            participants: req.user?._id,
        };

        // Verify user is in conversation
        const conversation = await Conversation.findOne(conversationFilter);
        if (!conversation) {
            return res
                .status(403)
                .json({ message: "Access denied or conversation not found" });
        }

        const query: QueryFilter<IMessage> = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate("senderId", "username displayName avatarUrl");

        const formattedMessages = messages.map((msg) => ({
            id: msg._id,
            conversation: msg.conversation,
            author: msg.sender,
            content: msg.content,
            createdAt: msg.createdAt,
            type: msg.type,
        }));

        return res.json(formattedMessages.reverse());
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const leaveConversation: RequestHandler<LeaveConversationRequest["params"]> = async (
    req,
    res,
) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user!._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.isUserParticipant(userId)) {
            return res
                .status(400)
                .json({ message: "You are not in this conversation" });
        }

        if (conversation.type === "direct") {
            return res
                .status(400)
                .json({ message: "Cannot leave a direct chat" });
        }

        if (
            conversation.type === "group" &&
            conversation.admin?.toString() === userId?.toString()
        ) {
            await Conversation.findByIdAndDelete(conversationId);
            return res.json({ message: "Conversation deleted as admin left" });
        }

        await conversation.save();
        return res.json({ message: "You have left the conversation" });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};
