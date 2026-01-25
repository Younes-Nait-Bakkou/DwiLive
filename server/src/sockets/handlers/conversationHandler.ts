import Message from "../../models/Message.js";
import type { IConversation } from "../../models/Conversation.js";
import type { IUser } from "../../models/User.js";
import type { Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";
import { isPopulated } from "../../utils/typeGuards.js";
import { validateSocket } from "../../middlewares/socket.validator.js";
import { ErrorCodes, type SocketResponse } from "../../types/socket.js";
import type { AppServer } from "../../types/server.js";
import {
    joinConversationRoomSchema,
    leaveConversationRoomSchema,
    sendMessageSchema,
    type JoinConversationRoomPayload,
    type LeaveConversationRoomPayload,
    type SendMessagePayload,
} from "../../shared/domains/socket.js";
import { MessageMapper } from "../../mappers/index.js";

export const registerConversationHandlers = (io: AppServer, socket: Socket) => {
    const joinConversationRoom = async (
        { conversationId }: JoinConversationRoomPayload,
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

    const leaveConversationRoom = async (
        { conversationId }: LeaveConversationRoomPayload,
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
        { conversationId, content, type }: SendMessagePayload,
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
                throw new Error(
                    "Internal Server Error: Message sender not populated for message",
                );
            }

            if (!isPopulated<IConversation>(conversation)) {
                throw new Error(
                    "Internal Server Error: Message conversation not populated for message",
                );
            }

            const payload = MessageMapper.toMessageDTO(populatedMessage);

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
        validateSocket(joinConversationRoomSchema, joinConversationRoom),
    );
    socket.on(
        SocketEvent.Client.LEAVE_CONVERSATION,
        validateSocket(leaveConversationRoomSchema, leaveConversationRoom),
    );
    socket.on(
        SocketEvent.Client.SEND_MESSAGE,
        validateSocket(sendMessageSchema, sendMessage),
    );
    // socket.on(
    //     SocketEvent.Client.TYPING_START,
    //     validateSocket(startTypingSchema, startTyping),
    // );
    // socket.on(
    //     SocketEvent.Client.TYPING_STOP,
    //     validateSocket(stopTypingSchema, stopTyping),
    // );
};
