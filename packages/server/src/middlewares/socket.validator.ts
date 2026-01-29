import { z } from "zod";
import {
    type EventData,
    type EventCallback,
    type EventHandler,
    ErrorCodes,
    type SocketResponse,
} from "@dwilive/shared/types/socket.js";

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

