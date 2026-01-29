// Exported Socket Types
export type SocketResponse =
    | { status: "OK"; data: unknown }
    | { status: "ERROR"; error: string; code?: string };

export enum ErrorCodes {
    UNAUTHORIZED = "UNAUTHORIZED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export type EventData = { [key: string]: unknown };
export type EventCallback = (response: SocketResponse) => void;
export type EventHandler<T extends EventData> = (
    data: T,
    callback: EventCallback,
) => void;
