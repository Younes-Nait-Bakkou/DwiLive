import { z } from "zod";
import { ConversationIdSchema } from "./conversation.js";

// --- Types (DTOs) ---
export interface MessageDTO {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: "text" | "image" | "system";
    metadata?: Record<string, unknown>;
    createdAt: string;
}

// --- Requests (Zod Schemas) ---
export const SendMessageSchema = z.object({
    body: z.object({
        conversationId: ConversationIdSchema,
        content: z.string().min(1).max(2000),
    }),
});

export type SendMessageBody = z.infer<typeof SendMessageSchema>["body"];
