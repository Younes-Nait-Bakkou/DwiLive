import Message from "../../models/Message.js";
import type { IConversation } from "../../models/Conversation.js";
import type { IUser } from "../../models/User.js";
import type { Server, Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";
import { isPopulated } from "../../utils/typeGuards.js";
import { ErrorCodes } from "../../types/socket.response.d.js";
import type { SocketResponse } from "../../types/socket.response.d.js";
import { validateSocket } from "../../middlewares/socket.validator.js";
import {
    joinConversationSchema,
    leaveConversationSchema,
    sendMessageSchema,
    startTypingSchema,
    stopTypingSchema,
} from "../../schemas/socket.schema.js";

export const registerConversationHandlers = (io: Server, socket: Socket) => {
    const joinConversation = async (
        { conversationId }: { conversationId: string },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }
            socket.join(conversationId);

            console.log(`User joined conversation: ${conversationId}`);
            socket
                .to(conversationId)
                .emit(SocketEvent.USER_JOINED_CONVERSATION, {
                    conversationId,
                    user: {
                        id: socket.user.id,
                        username: socket.user.username,
                    },
                });
            callback({ status: "OK", data: null });
        } catch (err) {
            console.error("CRITICAL SOCKET ERROR in joinConversation:", err);
            callback({
                status: "ERROR",
                error: "Internal Server Error. Please try again later.",
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };

    const leaveConversation = async (
        { conversationId }: { conversationId: string },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }
            socket.leave(conversationId);
            console.log(`User left conversation: ${conversationId}`);
            socket.to(conversationId).emit(SocketEvent.USER_LEFT_CONVERSATION, {
                conversationId,
                userId: socket.user.id,
            });
            callback({ status: "OK", data: null });
        } catch (err) {
            console.error("CRITICAL SOCKET ERROR in leaveConversation:", err);
            callback({
                status: "ERROR",
                error: "Internal Server Error. Please try again later.",
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };

    const sendMessage = async (
        {
            conversationId,
            content,
            type,
        }: {
            conversationId: string;
            content: string;
            type: "text" | "image";
        },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }

            const message = await Message.create({
                conversation: conversationId,
                content,
                type,
                sender: socket.user._id,
            });

            const populatedMessage = await message.populate([
                "sender",
                "conversation",
            ]);

            const sender = populatedMessage.sender;
            const conversation = populatedMessage.conversation;

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

            if (!isPopulated<IConversation>(conversation)) {
                console.error(
                    "Internal Server Error: Message conversation not populated for message:",
                    message._id,
                );
                return callback({
                    status: "ERROR",
                    error: "Internal Server Error. Please try again later.",
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                });
            }

            const payload = {
                id: conversation.id,
                author: {
                    id: sender?.id,
                    username: sender?.username,
                    avatarUrl: sender?.avatarUrl,
                },
                content: populatedMessage.content,
                createdAt: populatedMessage.createdAt,
            };

            io.to(conversationId).emit(SocketEvent.RECEIVE_MESSAGE, payload);
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

    const startTyping = async (
        { conversationId }: { conversationId: string },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }
            socket.to(conversationId).emit(SocketEvent.DISPLAY_TYPING, {
                conversationId,
                username: socket.user.username,
                isTyping: true,
            });
            callback({ status: "OK", data: null });
        } catch (err) {
            console.error("CRITICAL SOCKET ERROR in startTyping:", err);
            callback({
                status: "ERROR",
                error: "Internal Server Error. Please try again later.",
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };

    const stopTyping = async (
        { conversationId }: { conversationId: string },
        callback: (response: SocketResponse) => void,
    ) => {
        try {
            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                return callback({
                    status: "ERROR",
                    error: "You are not a participant of this conversation",
                    code: ErrorCodes.UNAUTHORIZED,
                });
            }
            socket.to(conversationId).emit(SocketEvent.DISPLAY_TYPING, {
                conversationId,
                username: socket.user.username,
                isTyping: false,
            });
            callback({ status: "OK", data: null });
        } catch (err) {
            console.error("CRITICAL SOCKET ERROR in stopTyping:", err);
            callback({
                status: "ERROR",
                error: "Internal Server Error. Please try again later.",
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };

    socket.on(
        SocketEvent.JOIN_CONVERSATION,
        validateSocket(joinConversationSchema, joinConversation),
    );
    socket.on(
        SocketEvent.LEAVE_CONVERSATION,
        validateSocket(leaveConversationSchema, leaveConversation),
    );
    socket.on(
        SocketEvent.SEND_MESSAGE,
        validateSocket(sendMessageSchema, sendMessage),
    );
    socket.on(
        SocketEvent.TYPING_START,
        validateSocket(startTypingSchema, startTyping),
    );
    socket.on(
        SocketEvent.TYPING_STOP,
        validateSocket(stopTypingSchema, stopTyping),
    );
};
