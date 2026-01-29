import type { IUser } from "../models/User.js";
import type { AuthDomain } from "@dwilive/shared/domains";
import { UserMapper } from "./index.js";

const _toAuthDTO = (user: IUser, token: string): AuthDomain.AuthDTO => {
    return {
        token: token,
        user: UserMapper.toUserDTO(user),
    };
};

export const toLoginResponse = (
    user: IUser,
    token: string,
): AuthDomain.LoginResponse => {
    return _toAuthDTO(user, token);
};

export const toRegisterResponse = (
    user: IUser,
    token: string,
): AuthDomain.RegisterResponse => {
    return _toAuthDTO(user, token);
};
