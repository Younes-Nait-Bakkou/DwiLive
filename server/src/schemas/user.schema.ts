import { createPrefixedIdSchema } from "../utils/zod.js";

export const userIdSchema = createPrefixedIdSchema("user", {
    invalidError: "User ID is invalid",
    requiredError: "User ID is required",
});
