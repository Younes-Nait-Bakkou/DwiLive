import type { IUser } from "../models/User.js";
import type { Auth } from "../shared/domains/index.js";

const _toAuthDTO = (user: IUser, token: string): Auth.AuthDTO => {
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
): Auth.LoginResponse => {
    return _toAuthDTO(user, token);
};

export const toRegisterResponse = (
    user: IUser,
    token: string,
): Auth.RegisterResponse => {
    return _toAuthDTO(user, token);
};
