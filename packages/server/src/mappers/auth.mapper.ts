import type { AuthDTO, LoginResponse, RegisterResponse } from "@dwilive/shared";
import type { IUser } from "../models/User.js";
import { UserMapper } from "./index.js";

const _toAuthDTO = (user: IUser, token: string): AuthDTO => {
    return {
        token: token,
        user: UserMapper.toUserDTO(user),
    };
};

export const toLoginResponse = (user: IUser, token: string): LoginResponse => {
    return _toAuthDTO(user, token);
};

export const toRegisterResponse = (
    user: IUser,
    token: string,
): RegisterResponse => {
    return _toAuthDTO(user, token);
};
