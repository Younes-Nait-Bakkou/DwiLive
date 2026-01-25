// shared/domains/auth.ts
import { z } from "zod";

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
    username: z.string(),
    password: z.string(),
});

export const RegisterSchema = z.object({
    username: z.string(),
    password: z.string(),
    displayName: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

// --- Responses ---
export type LoginResponse = AuthDTO;
export type RegisterResponse = AuthDTO;
