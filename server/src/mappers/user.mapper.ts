import type { IUser } from "../models/User.js";
import type { UserDomain } from "../shared/domains/index.js";

const _toUserDTO = (user: IUser): UserDomain.UserDTO => {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
};

export const toGetMeResponse = (user: IUser): UserDomain.GetMeResponse => {
    return _toUserDTO(user);
};

export const toUpdateMeResponse = (
    user: IUser,
): UserDomain.UpdateMeResponse => {
    return _toUserDTO(user);
};

export const toSearchUsersResponse = (
    users: IUser[],
): UserDomain.SearchUsersResponse => {
    return users.map((u) => _toUserDTO(u));
};
