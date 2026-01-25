import User, { type IUser } from "../models/User.js";
import mongoose, { type QueryFilter } from "mongoose";
import { UserDomain } from "../shared/domains/index.js";
import { UserMapper } from "../mappers/index.js";
import type { AuthHandler } from "../types/api.types.js";

export const getMe: AuthHandler<void, UserDomain.GetMeResponse> = async (
    req,
    res,
) => {
    const response = UserMapper.toGetMeResponse(req.user);
    return res.json(response);
};

export const updateMe: AuthHandler<
    UserDomain.UpdateMeBody,
    UserDomain.UpdateMeResponse
> = async (req, res) => {
    try {
        const { displayName, avatarUrl } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (displayName) user.displayName = displayName;
        if (avatarUrl) user.avatarUrl = avatarUrl;

        const updatedUser = await user.save();

        const response = UserMapper.toUpdateMeResponse(updatedUser);

        return res.json(response);
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

export const searchUsers: AuthHandler<
    void,
    UserDomain.SearchUsersResponse,
    void,
    UserDomain.SearchUsersQuery
> = async (req, res) => {
    try {
        const { q: searchTerm } = req.query;

        const searchFilter: QueryFilter<IUser> = {
            $or: [
                { username: { $regex: searchTerm, $options: "i" } },
                { displayName: { $regex: searchTerm, $options: "i" } },
            ],
            _id: { $ne: req.user?._id || null },
        };

        const users = await User.find(searchFilter).limit(20);

        const response = UserMapper.toSearchUsersResponse(users);

        return res.json(response);
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
