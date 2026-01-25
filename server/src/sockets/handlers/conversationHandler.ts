import Message from "../../models/Message.js";
import type { IConversation } from "../../models/Conversation.js";
import type { IUser } from "../../models/User.js";
import type { Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";
import { isPopulated } from "../../utils/typeGuards.js";
import { validateSocket } from "../../middlewares/socket.validator.js";
import { ErrorCodes, type SocketResponse } from "../../types/socket.js";
import type { AppServer } from "../../types/server.js";
import { SystemMessageType } from "../../shared/constants/system-messages.js";

export const registerConversationHandlers = (io: AppServer, socket: Socket) => {
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

            const message = await Message.create({
                conversation: conversationId,
                type: "system",
                content: SystemMessageType.USER_JOINED,
                metadata: {
                    username: socket.user.username,
                    userId: socket.user.id,
                },
            });

            socket
                .to(conversationId)
                .emit(SocketEvent.Server.USER_JOINED_CONVERSATION, {
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
            socket
                .to(conversationId)
                .emit(SocketEvent.Server.USER_LEFT_CONVERSATION, {
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

            io.to(conversationId).emit(
                SocketEvent.Server.RECEIVE_MESSAGE,
                payload,
            );
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
            socket.to(conversationId).emit(SocketEvent.Server.DISPLAY_TYPING, {
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
            socket.to(conversationId).emit(SocketEvent.Server.DISPLAY_TYPING, {
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
        SocketEvent.Client.JOIN_CONVERSATION,
        validateSocket(joinConversationSchema, joinConversation),
    );
    socket.on(
        SocketEvent.Client.LEAVE_CONVERSATION,
        validateSocket(leaveConversationSchema, leaveConversation),
    );
    socket.on(
        SocketEvent.Client.SEND_MESSAGE,
        validateSocket(sendMessageSchema, sendMessage),
    );
    socket.on(
        SocketEvent.Client.TYPING_START,
        validateSocket(startTypingSchema, startTyping),
    );
    socket.on(
        SocketEvent.Client.TYPING_STOP,
        validateSocket(stopTypingSchema, stopTyping),
    );
};
