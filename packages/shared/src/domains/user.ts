import { z } from "../utils/zod.js";
import { ZodUtils } from "../utils/index.js";

// --- Types (DTOs) ---
export interface UserDTO {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

// --- Schemas ---
export const UserIdSchema = ZodUtils.createPrefixedIdSchema("user", {
    invalidError: "User ID is invalid",
    requiredError: "User ID is required",
});

export const UpdateMeSchema = z.object({
    body: z.object({
        displayName: z.string().optional(),
        avatarUrl: z.url().optional(),
    }),
});

export const SearchUsersSchema = z.object({
    query: z.object({
        q: z.string().min(1, "Search query cannot be empty"),
    }),
});

// --- Derived Types ---
export type UserId = z.infer<typeof UserIdSchema>;
export type UpdateMeBody = z.infer<typeof UpdateMeSchema>["body"];
export type SearchUsersQuery = z.infer<typeof SearchUsersSchema>["query"];

// --- Responses ---
export type GetMeResponse = UserDTO;
export type UpdateMeResponse = UserDTO;
export type SearchUsersResponse = UserDTO[];
