import { Server as SocketIOServer } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
}
 from "@dwilive/shared/constants/events.js";

export type AppServer = SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents
>;
