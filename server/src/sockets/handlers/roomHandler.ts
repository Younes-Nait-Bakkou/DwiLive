import Message from "../../models/Message.js";
import type { IRoom } from "../../models/Room.js";
import type { IUser } from "../../models/User.js";
import type { Server, Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";
import { isPopulated } from "../../utils/typeGuards.js";
import { ErrorCodes } from "../../types/socket.response.d.js";
import type { SocketResponse } from "../../types/socket.response.d.js";

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const joinRoom = async ({ roomId }: { roomId: string }) => {
        socket.join(roomId);

        console.log(`User joined room: ${roomId}`);
        socket.to(roomId).emit(SocketEvent.USER_JOINED_ROOM, {
            roomId,
            user: {
                id: socket.user.id,
                username: socket.user.username,
            },
        });
    };

    const leaveRoom = async ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
        socket.to(roomId).emit(SocketEvent.USER_LEFT_ROOM, {
            roomId,
            userId: socket.user.id,
        });
    };

    const sendMessage = async (
        {
            roomId,
            content,
            type,
        }: {
            roomId: string;
            content: string;
            type: "text" | "image";
        },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            if (!content) {
                console.warn(
                    `User ${socket.user.id} sent empty message to room ${roomId}.`,
                );
                return callback({
                    status: "ERROR",
                    error: "Message content cannot be empty",
                    code: ErrorCodes.VALIDATION_ERROR,
                });
            }

            const isMember = await socket.user.isInRoom(roomId);
            if (!isMember) {
                console.warn(
                    `User ${socket.user.id} unauthorized for room ${roomId}`,
                );
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }

            const message = await Message.create({
                room: roomId,
                content,
                type,
                sender: socket.user._id,
            });

            const populatedMessage = await message.populate(["sender", "room"]);

            const sender = populatedMessage.sender;
            const room = populatedMessage.room;

            if (!isPopulated<IUser>(sender)) {
                console.error(
                    "Internal Server Error: Message sender not populated for message:",
                    message._id,
                );
                return callback({
                    status: "ERROR",
                    error: "Internal Server Error. Please try again later.",
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                });
            }

            if (!isPopulated<IRoom>(room)) {
                console.error(
                    "Internal Server Error: Message room not populated for message:",
                    message._id,
                );
                return callback({
                    status: "ERROR",
                    error: "Internal Server Error. Please try again later.",
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                });
            }

            const payload = {
                id: room.id,
                author: {
                    id: sender?.id,
                    username: sender?.username,
                    avatarUrl: sender?.avatarUrl,
                },
                content: populatedMessage.content,
                createdAt: populatedMessage.createdAt,
            };

            io.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, payload);
            callback({ status: "OK", data: payload });
        } catch (err) {
            console.error("CRITICAL SOCKET ERROR in sendMessage:", err);
            callback({
                status: "ERROR",
                error: "Internal Server Error. Please try again later.",
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };

    const startTyping = ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit(SocketEvent.DISPLAY_TYPING, {
            roomId,
            username: socket.user.username,
            isTyping: true,
        });
    };

    const stopTyping = ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit(SocketEvent.DISPLAY_TYPING, {
            roomId,
            username: socket.user.username,
            isTyping: false,
        });
    };

    socket.on(SocketEvent.JOIN_ROOM, joinRoom);
    socket.on(SocketEvent.LEAVE_ROOM, leaveRoom);
    socket.on(SocketEvent.SEND_MESSAGE, sendMessage);
    socket.on(SocketEvent.TYPING_START, startTyping);
    socket.on(SocketEvent.TYPING_STOP, stopTyping);
};
