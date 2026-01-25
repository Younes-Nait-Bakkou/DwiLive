import { Server as SocketIOServer } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "../shared/socket-interfaces.js";

export type AppServer = SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents
>;
