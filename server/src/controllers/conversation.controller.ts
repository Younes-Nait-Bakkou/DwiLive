import Conversation, { type IConversation } from "../models/Conversation.js";
import Message, { type IMessage } from "../models/Message.js";
import mongoose, { type QueryFilter } from "mongoose";
import { log } from "node:console";
import type { AuthHandler } from "../types/api.js";
import type { ConversationDomain } from "../shared/domains/index.js";
import { ConversationMapper, MessageMapper } from "../mappers/index.js";

export const createConversation: AuthHandler<
    ConversationDomain.CreateConversationBody,
    ConversationDomain.CreateConversationResponse
> = async (req, res) => {
    try {
        const { type, participants, name, isPrivate } = req.body;

        if (type === "direct") {
            const otherUserId = new mongoose.Types.ObjectId(participants![0]);
            const myId = req.user._id;

            const conversationFilter: QueryFilter<IConversation> = {
                type: "direct",
                participants: { $all: [myId, otherUserId], $size: 2 },
            };

            let conversation = await Conversation.findOne(conversationFilter);

            if (conversation) {
                await conversation.populate("participants admin");
                return res.status(200).json();
            }

            conversation = await Conversation.create({
                type: "direct",
                participants: [myId, otherUserId],
                isPrivate: true,
            });

            await conversation.populate("participants admin");

            const response = ConversationMapper.toCreateConversationResponse(
                conversation,
                req.user._id,
            );

            return res.status(201).json(response);
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

            const response = ConversationMapper.toCreateConversationResponse(
                conversation,
                req.user._id,
            );

            return res.status(201).json(response);
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

export const getConversations: AuthHandler<
    void,
    ConversationDomain.GetConversationsResponse
> = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const conversationFilter: QueryFilter<IConversation> = {
            participants: req.user?._id,
        };

        const conversations = await Conversation.find(conversationFilter)
            .populate("participants admin")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                },
            })
            .sort({ updatedAt: -1 });

        const response = ConversationMapper.toGetConversationsResponse(
            conversations,
            req.user._id,
        );
        console.log(response);

        return res.json(response);
    } catch (error: unknown) {
        console.log(error);
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

export const addMember: AuthHandler<
    ConversationDomain.AddMemberBody,
    ConversationDomain.AddMemberResponse,
    ConversationDomain.AddMemberParams
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
            return res
                .status(400)
                .json({ message: "User already in conversation" });
        }

        conversation.participants.push(new mongoose.Types.ObjectId(userId));

        await conversation.save();

        const response = ConversationMapper.toAddMemberResponse(
            conversation,
            req.user._id,
        );

        return res.json(response);
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

export const removeMember: AuthHandler<
    void,
    ConversationDomain.RemoveMemberResponse,
    ConversationDomain.RemoveMemberParams
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
            return res.status(400).json({
                message: "Member is not a participant of this conversation",
            });
        }

        if (userId.toString() == req.user?.toString()) {
            return res.status(400).json({
                message: "You cannot kick yourself out of the conversation",
            });
        }

        await conversation.save();

        const response = ConversationMapper.toRemoveMemberResponse(
            conversation,
            req.user._id,
        );

        return res.json(response);
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

export const getMessages: AuthHandler<
    void,
    ConversationDomain.GetMessagesResponse,
    ConversationDomain.GetMessagesParams,
    ConversationDomain.GetMessagesQuery
> = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = "50", before } = req.query;

        const conversationFilter: QueryFilter<IConversation> = {
            _id: conversationId,
            participants: req.user._id,
        };

        // Verify user is in conversation
        const conversation = await Conversation.findOne(conversationFilter);
        if (!conversation) {
            return res
                .status(403)
                .json({ message: "Access denied or conversation not found" });
        }

        const query: QueryFilter<IMessage> = { conversation: conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate("sender");

        const response = messages
            .map((m) => MessageMapper.toMessageDTO(m))
            .reverse();

        return res.json(response);
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

export const leaveConversation: AuthHandler<
    void,
    ConversationDomain.LeaveConversationResponse,
    ConversationDomain.LeaveConversationParams
> = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

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
            return res.status(204);
        }

        await conversation.save();

        const response = ConversationMapper.toLeaveConversationResponse(
            conversation,
            req.user._id,
        );

        return res.json(response);
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

export const joinConversation: AuthHandler<
    void,
    ConversationDomain.LeaveConversationResponse,
    ConversationDomain.LeaveConversationParams
> = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

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
            return res.status(204);
        }

        await conversation.save();

        const response = ConversationMapper.toLeaveConversationResponse(
            conversation,
            req.user._id,
        );

        return res.json(response);
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
