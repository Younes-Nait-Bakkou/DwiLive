import type { SocketEvent } from "../../config/events.js";
import type { EventCallback } from "../../middlewares/socket.validator.js";
import type { SendMessageRequest } from "../domains/socket.js";

export interface ServerToClientEvents {
    [SocketEvent.Server.RECEIVE_MESSAGE]: (message: string) => void;

    [SocketEvent.Server.USER_JOINED_CONVERSATION]: (data: {
        conversationId: string;
        user: string;
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
