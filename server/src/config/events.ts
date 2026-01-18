export enum SocketEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",

    // Room events
    JOIN_ROOM = "room:join",
    USER_JOINED_ROOM = "room:user_joined",
    LEAVE_ROOM = "room:leave",
    USER_LEFT_ROOM = "room:user_left",
}
