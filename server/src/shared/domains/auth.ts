import { z } from "../utils/zod.js";

// --- Types (DTOs) ---
export interface AuthDTO {
    token: string;
    user: {
        id: string;
        username: string;
        displayName: string;
    };
}

// --- Requests (Zod Schemas) ---
export const LoginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string(),
    }),
});

export const RegisterSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string(),
        displayName: z.string().optional(),
    }),
});

export type LoginBody = z.infer<typeof LoginSchema>["body"];
export type RegisterBody = z.infer<typeof RegisterSchema>["body"];

// --- Responses ---
export type LoginResponse = AuthDTO;
export type RegisterResponse = AuthDTO;
