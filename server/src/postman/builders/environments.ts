import config from "../../config/index.js";

const PLAIN_PASSWORD = "password123";
const JWT_SECRET = config.jwt.secret;

export function createGlobalEnvironment() {
    return {
        id: "d8f8944c-1c5c-443b-80dd-738d2f446977",
        name: "DwiLive Global",
        values: [
            {
                key: "baseUrl",
                value: "http://localhost:3001/api/v1",
                type: "default",
                enabled: true,
            },
            {
                key: "jwt_secret",
                value: JWT_SECRET,
                type: "secret",
                enabled: true,
            },
            {
                key: "jwt_expires_in",
                value: config.jwt.expiresIn,
                type: "default",
                enabled: true,
            },
        ],
        _postman_variable_scope: "globals",
    };
}

export function createUserEnvironment(username: string) {
    return {
        name: `${username}`,
        values: [
            {
                key: "username",
                value: username,
                type: "default",
                enabled: true,
            },
            {
                key: "password",
                value: PLAIN_PASSWORD,
                type: "secret",
                enabled: true,
            },
            {
                key: "user_id",
                value: "", // Will be populated by the login script
                type: "default",
                enabled: true,
            },
        ],
        _postman_variable_scope: "environment",
    };
}
