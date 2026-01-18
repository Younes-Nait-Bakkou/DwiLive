import type { RequestHandler } from "express";
import Room, { type IRoom } from "../models/Room.js";
import Message, { type IMessage } from "../models/Message.js";
import mongoose, { type QueryFilter } from "mongoose";
import {
    type CreateRoomRequest,
    type AddMemberRequest,
    type RemoveMemberRequest,
    type LeaveRoomRequest,
    type GetMessagesRequest,
} from "../schemas/room.schema.js";
import { log } from "node:console";

export const createRoom: RequestHandler<
    object,
    object,
    CreateRoomRequest["body"]
> = async (req, res) => {
    try {
        const { type, participants, name, isPrivate } = req.body;

        if (!req.user) return;

        if (type === "direct") {
            const otherUserId = new mongoose.Types.ObjectId(participants![0]);
            const myId = req.user._id;

            const roomFilter: QueryFilter<IRoom> = {
                type: "direct",
                participants: { $all: [myId, otherUserId], $size: 2 },
            };

            // Check if direct room already exists
            let room = await Room.findOne(roomFilter);

            if (room) {
                await room.populate("participants admin");
                return res.status(200).json(room);
            }

            room = await Room.create({
                type: "direct",
                participants: [myId, otherUserId],
                isPrivate: true,
            });

            await room.populate("participants admin");
            return res.status(201).json(room);
        }

        if (type === "group") {
            console.log(participants);
            const room = await Room.create({
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

            await room.populate("participants admin");
            return res.status(201).json(room);
        }

        return res.status(400).json({ message: "Invalid room type" });
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

export const getRooms: RequestHandler = async (req, res) => {
    try {
        console.log(req.user.id);
        const roomFilter: QueryFilter<IRoom> = {
            participants: req.user?._id,
        };
        const rooms = await Room.find(roomFilter)
            .populate("participants")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.json(rooms);
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
        const { roomId } = req.params;
        const { userId } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.type !== "group") {
            return res
                .status(400)
                .json({ message: "Cannot add members to a direct chat" });
        }

        if (!room.isAdmin(req.user)) {
            return res
                .status(403)
                .json({ message: "Only the admin can add members" });
        }

        if (room.isUserParticipant(userId)) {
            return res.status(400).json({ message: "User already in room" });
        }

        room.participants.push(new mongoose.Types.ObjectId(userId));
        await room.save();

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
        const { roomId, userId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.type === "direct") {
            return res
                .status(400)
                .json({ message: "Cannot remove members from a direct chat" });
        }

        if (!room.isAdmin(req.user)) {
            return res
                .status(403)
                .json({ message: "Only the admin can remove members" });
        }

        if (!room.isUserParticipant(userId)) {
            return res
                .status(400)
                .json({ message: "Member is not a participant of this room" });
        }

        if (userId.toString() == req.user?.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot kick yourself out of the room" });
        }

        await room.save();
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
        const { roomId } = req.params;
        const { limit = "50", before } = req.query;

        const roomFilter: QueryFilter<IRoom> = {
            _id: roomId,
            participants: req.user?._id,
        };

        // Verify user is in room
        const room = await Room.findOne(roomFilter);
        if (!room) {
            return res
                .status(403)
                .json({ message: "Access denied or room not found" });
        }

        const query: QueryFilter<IMessage> = { roomId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate("senderId", "username displayName avatarUrl");

        const formattedMessages = messages.map((msg) => ({
            id: msg._id,
            roomId: msg.roomId,
            author: msg.senderId,
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

export const leaveRoom: RequestHandler<LeaveRoomRequest["params"]> = async (
    req,
    res,
) => {
    try {
        const { roomId } = req.params;
        const userId = req.user!._id;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.isUserParticipant(userId)) {
            return res
                .status(400)
                .json({ message: "You are not in this room" });
        }

        if (room.type === "direct") {
            return res
                .status(400)
                .json({ message: "Cannot leave a direct chat" });
        }

        if (
            room.type === "group" &&
            room.admin?.toString() === userId?.toString()
        ) {
            await Room.findByIdAndDelete(roomId);
            return res.json({ message: "Room deleted as admin left" });
        }

        await room.save();
        return res.json({ message: "You have left the room" });
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
