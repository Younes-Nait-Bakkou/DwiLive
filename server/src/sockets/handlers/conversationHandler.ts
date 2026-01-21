import Message from "../../models/Message.js";
import type { IConversation } from "../../models/Conversation.js";
import type { IUser } from "../../models/User.js";
import type { Server, Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";
import { isPopulated } from "../../utils/typeGuards.js";
import { ErrorCodes } from "../../types/socket.response.d.js";
import type { SocketResponse } from "../../types/socket.response.d.js";

export const registerConversationHandlers = (io: Server, socket: Socket) => {
    const joinConversation = async ({ conversationId }: { conversationId: string }) => {
        socket.join(conversationId);

        console.log(`User joined conversation: ${conversationId}`);
        socket.to(conversationId).emit(SocketEvent.USER_JOINED_CONVERSATION, {
            conversationId,
            user: {
                id: socket.user.id,
                username: socket.user.username,
            },
        });
    };

    const leaveConversation = async ({ conversationId }: { conversationId: string }) => {
        socket.leave(conversationId);
        console.log(`User left conversation: ${conversationId}`);
        socket.to(conversationId).emit(SocketEvent.USER_LEFT_CONVERSATION, {
            conversationId,
            userId: socket.user.id,
        });
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
            if (!content) {
                console.warn(
                    `User ${socket.user.id} sent empty message to conversation ${conversationId}.`,
                );
                return callback({
                    status: "ERROR",
                    error: "Message content cannot be empty",
                    code: ErrorCodes.VALIDATION_ERROR,
                });
            }

            const isMember = await socket.user.isInConversation(conversationId);
            if (!isMember) {
                console.warn(
                    `User ${socket.user.id} unauthorized for conversation ${conversationId}`,
                );
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

            const populatedMessage = await message.populate(["sender", "conversation"]);

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

    const startTyping = ({ conversationId }: { conversationId: string }) => {
        socket.to(conversationId).emit(SocketEvent.DISPLAY_TYPING, {
            conversationId,
            username: socket.user.username,
            isTyping: true,
        });
    };

    const stopTyping = ({ conversationId }: { conversationId: string }) => {
        socket.to(conversationId).emit(SocketEvent.DISPLAY_TYPING, {
            conversationId,
            username: socket.user.username,
            isTyping: false,
        });
    };

    socket.on(SocketEvent.JOIN_CONVERSATION, joinConversation);
    socket.on(SocketEvent.LEAVE_CONVERSATION, leaveConversation);
    socket.on(SocketEvent.SEND_MESSAGE, sendMessage);
    socket.on(SocketEvent.TYPING_START, startTyping);
    socket.on(SocketEvent.TYPING_STOP, stopTyping);
};
