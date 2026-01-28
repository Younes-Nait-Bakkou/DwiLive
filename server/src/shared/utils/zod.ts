import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { isValidObjectId } from "mongoose";

extendZodWithOpenApi(z);

export { z };

/**
 * Creates a Zod schema that strips a prefix and validates the MongoDB ObjectId.
 * * @param prefix The prefix to strip (e.g. "user_", "room_")
 * @param options Custom error messages for invalid ID or required field
 */
export const createPrefixedIdSchema = (
    prefix: string,
    options?: {
        invalidError?: string;
        requiredError?: string;
    },
) => {
    prefix += "_";

    const stripPrefix = (val: unknown) => {
        if (typeof val === "string" && val.startsWith(prefix)) {
            return val.replace(prefix, "");
        }
        return val;
    };

    return z.preprocess(
        stripPrefix,
        z
            .string({
                error: options?.requiredError,
            })
            .refine((val) => isValidObjectId(val), {
                message: options?.invalidError || `Invalid ${prefix}ID format`,
            }),
    );
};
