import type { RequestHandler } from "express";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/index.js";
import mongoose from "mongoose";

export interface IJwtPayload extends JwtPayload {
    id: string;
}

const generateToken = (userId: string) => {
    const payload: IJwtPayload = { id: userId };
    const options: SignOptions = {
        expiresIn: config.jwt.expiresIn,
    };

    return jwt.sign(payload, config.jwt.secret, options);
};

export const register: RequestHandler = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            username,
            password,
            displayName: displayName || username,
        });

        const token = generateToken(user._id.toString());

        return res.status(201).json({
            token,
            user,
        });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

export const login: RequestHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id.toString());

        return res.json({
            token,
            user,
        });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle Standard Errors
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }

        // Handle Unknowns
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};
