import type { IUser } from "../models/User.js";
import type { AuthDomain } from "../shared/domains/index.js";

const _toAuthDTO = (user: IUser, token: string): AuthDomain.AuthDTO => {
    return {
        token: token,
        user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
        },
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
