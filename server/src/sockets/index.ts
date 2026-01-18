import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";
import type { IJwtPayload } from "../controllers/auth.js";

export const setupSockets = (io: Server) => {
    io.use(async (socket: Socket, next) => {
        const token =
            socket.handshake.auth.token || socket.handshake.query.token;

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
};
