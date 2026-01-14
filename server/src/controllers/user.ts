import type { RequestHandler } from "express";
import User, { type IUser } from "../models/User.js";
import mongoose, { type QueryFilter } from "mongoose";

export const getMe: RequestHandler = async (req, res) => {
    res.json(req.user);
};

export const updateMe: RequestHandler = async (req, res) => {
    try {
        const { displayName, avatarUrl } = req.body;
        const user = await User.findById(req.user?._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.displayName = displayName || user.displayName;
        user.avatarUrl = avatarUrl || user.avatarUrl;

        const updatedUser = await user.save();

        return res.json(updatedUser);
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

export const searchUsers: RequestHandler = async (req, res) => {
    try {
        const query = req.query.q as string;

        if (!query) {
            return res
                .status(400)
                .json({ message: "Search query is required" });
        }

        const searchFilter: QueryFilter<IUser> = {
            $or: [
                { username: { $regex: query, $options: "i" } },
                { displayName: { $regex: query, $options: "i" } },
            ],
            _id: { $ne: req.user?._id || null },
        };

        const users = await User.find(searchFilter).limit(20);

        return res.json(users);
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
