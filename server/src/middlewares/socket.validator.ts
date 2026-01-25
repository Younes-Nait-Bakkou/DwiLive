import { z } from "zod";
import type { SocketResponse } from "../types/socket.response.d.js";
import { ErrorCodes } from "../types/socket.response.d.js";

type EventData = { [key: string]: unknown };
type EventCallback = (response: SocketResponse) => void;
type EventHandler<T extends EventData> = (
    data: T,
    callback: EventCallback,
) => void;

export const validateSocket = <T extends EventData>(
    schema: z.ZodSchema<T>,
    handler: EventHandler<T>,
) => {
    return (data: unknown, callback: EventCallback) => {
        const result = schema.safeParse(data);

        if (!result.success) {
            return callback({
                status: "ERROR",
                error: "Validation failed",
                code: ErrorCodes.VALIDATION_ERROR,
            });
        }

        handler(result.data, callback);
    };
};
export type { EventData, EventCallback, EventHandler };
