import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";

export const protect: RequestHandler = async (req, res, next) => {
    let token: string | undefined;

    const prefix = config.jwt.prefix;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith(prefix)
    ) {
        try {
            let token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, invalid token" });
            }

            const decoded = jwt.verify(token, config.jwt.secret);

            const user = await User.findById(decoded.valueOf);

            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found" });
            }

            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return res
                .status(401)
                .json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
