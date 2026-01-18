import type { Server, Socket } from "socket.io";
import { SocketEvent } from "../../config/events.js";

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const joinRoom = async ({ roomId }: { roomId: string }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
        socket
            .to(roomId)
            .emit(SocketEvent.USER_JOINED_ROOM, { roomId, user: socket.user });
    };

    socket.on(SocketEvent.JOIN_ROOM, joinRoom);

    const leaveRoom = async ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
        socket
            .to(roomId)
            .emit(SocketEvent.USER_LEFT_ROOM, { roomId, user: socket.user });
    };

    socket.on(SocketEvent.LEAVE_ROOM, leaveRoom);
};
