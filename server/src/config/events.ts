export enum SocketEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",

    // Conversation events
    JOIN_CONVERSATION = "conversation:join",
    LEAVE_CONVERSATION = "conversation:leave",
    USER_JOINED_CONVERSATION = "conversation:user_joined",
    USER_LEFT_CONVERSATION = "conversation:user_left",

    // Message events
    SEND_MESSAGE = "message:send",
    RECEIVE_MESSAGE = "message:receive",

    // Typing events
    TYPING_START = "typing:start",
    TYPING_STOP = "typing:stop",
    DISPLAY_TYPING = "typing:display",
}
