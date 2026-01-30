import type { IUser } from "../models/User.js";
import type {
    GetMeResponse,
    SearchUsersResponse,
    UpdateMeResponse,
    UserDTO,
} from "@dwilive/shared/domains";
import { toPublicId } from "../utils/ids.js";

export const toUserDTO = (user: IUser): UserDTO => {
    return {
        id: toPublicId("user", user.id),
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
};

export const toGetMeResponse = (user: IUser): GetMeResponse => {
    return toUserDTO(user);
};

export const toUpdateMeResponse = (user: IUser): UpdateMeResponse => {
    return toUserDTO(user);
};

export const toSearchUsersResponse = (users: IUser[]): SearchUsersResponse => {
    return users.map((u) => toUserDTO(u));
};
