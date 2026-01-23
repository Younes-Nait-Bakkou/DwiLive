export type SocketResponse =
    | { status: "OK"; data: unknown }
    | { status: "ERROR"; error: string; code?: string };

export enum ErrorCodes {
    UNAUTHORIZED = "UNAUTHORIZED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

