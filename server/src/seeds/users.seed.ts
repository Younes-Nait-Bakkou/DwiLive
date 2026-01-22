import type { AnyBulkWriteOperation } from "mongoose";
import User, { type IUser } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

export interface SeedUsersArgs {
    clearUsers: boolean;
}
export const usersToSeed = [
    {
        username: "user_1",
        displayName: "User 1",
        password: "password123",
    },
    {
        username: "user_2",
        displayName: "User 2",
        password: "password123",
    },
];

export async function seedUsers({ clearUsers }: SeedUsersArgs) {
    const users = await Promise.all(
        usersToSeed.map(async (user) => ({
            ...user,
            password: await hashPassword(user.password),
        })),
    );
    const userNames = users.map((u) => u.username);

    if (clearUsers) {
        await User.deleteMany({});
        await User.insertMany(users);
        console.log(`✅ Users cleared and created: ${userNames.join(", ")}`);
        return;
    }

    const existingUsers = await User.find({ username: { $in: userNames } })
        .select("username")
        .lean();
    const existingUsernames = existingUsers.map((u) => u.username);

    const operations: AnyBulkWriteOperation<IUser>[] = users.map((user) => ({
        updateOne: {
            filter: { username: user.username },
            update: { $set: user },
            upsert: true,
        },
    }));

    await User.bulkWrite(operations);

    const createdUsernames = userNames.filter(
        (u) => !existingUsernames.includes(u),
    );
    const updatedUsernames = userNames.filter((u) =>
        existingUsernames.includes(u),
    );

    if (createdUsernames.length > 0) {
        console.log(`✅ Users created: ${createdUsernames.join(", ")}`);
    }
    if (updatedUsernames.length > 0) {
        console.log(`✅ Users updated: ${updatedUsernames.join(", ")}`);
    }
    if (createdUsernames.length === 0 && updatedUsernames.length === 0) {
        console.log("No users to seed.");
    }
}
