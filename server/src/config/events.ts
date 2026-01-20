export enum SocketEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",

    // Room events
    JOIN_ROOM = "room:join",
    LEAVE_ROOM = "room:leave",
    USER_JOINED_ROOM = "room:user_joined",
    USER_LEFT_ROOM = "room:user_left",

    // Message events
    SEND_MESSAGE = "message:send",
    RECEIVE_MESSAGE = "message:receive",

    // Typing events
    TYPING_START = "typing:start",
    TYPING_STOP = "typing:stop",
    DISPLAY_TYPING = "typing:display",
}
