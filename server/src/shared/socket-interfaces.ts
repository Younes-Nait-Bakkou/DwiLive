import type { SocketEvent } from "../config/events.js";
import type { EventCallback } from "../middlewares/socket.validator.js";
import type { SendMessageRequest } from "../schemas/socket.schema.js";
import type { Message, UserBasic } from "./conversation.types.js";

export interface ServerToClientEvents {
    [SocketEvent.Server.RECEIVE_MESSAGE]: (message: Message) => void;

    [SocketEvent.Server.USER_JOINED_CONVERSATION]: (data: {
        conversationId: string;
        user: UserBasic;
    }) => void;

    [SocketEvent.Server.DISPLAY_TYPING]: (data: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
    }) => void;
}

export interface ClientToServerEvents {
    [SocketEvent.Client.SEND_MESSAGE]: (
        payload: SendMessageRequest,
        callback: EventCallback,
    ) => void;
}
