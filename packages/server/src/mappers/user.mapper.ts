import type { IUser } from "../models/User.js";
import type { UserDomain } from "@dwilive/shared/domains";
import { toPublicId } from "../utils/ids.js";

export const toUserDTO = (user: IUser): UserDomain.UserDTO => {
    return {
        id: toPublicId("user", user.id),
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
};

export const toGetMeResponse = (user: IUser): UserDomain.GetMeResponse => {
    return toUserDTO(user);
};

export const toUpdateMeResponse = (
    user: IUser,
): UserDomain.UpdateMeResponse => {
    return toUserDTO(user);
};

export const toSearchUsersResponse = (
    users: IUser[],
): UserDomain.SearchUsersResponse => {
    return users.map((u) => toUserDTO(u));
};
