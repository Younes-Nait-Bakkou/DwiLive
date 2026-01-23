import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";
import type { IJwtPayload } from "../controllers/auth.js";
import { SocketEvent } from "../config/events.js";
import { registerConversationHandlers } from "./handlers/conversationHandler.js";
import { jsonParseMiddleware } from "../middlewares/socket.middleware.js";

export const setupSockets = (io: Server) => {
    io.use(async (socket: Socket, next) => {
        const prefix = config.jwt.prefix;
        const authToken = socket.handshake.auth.token;
        const queryToken = socket.handshake.query.token;

        let token =
            (authToken &&
                authToken.startsWith(prefix) &&
                authToken.split(" ")[1]) ||
            queryToken;

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const payload = jwt.verify(token, config.jwt.secret) as IJwtPayload;

            const user = await User.findById(payload.id);

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            console.log(error);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on(SocketEvent.System.CONNECT, (socket) => {
        console.log(`User connected: ${socket.user.username}`);

        socket.use(jsonParseMiddleware);

        registerConversationHandlers(io, socket);

        socket.on(SocketEvent.System.DISCONNECT, () => {
            console.log(`User disconnected: ${socket.user.username}`);
        });
    });
};
