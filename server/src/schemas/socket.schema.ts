import { object, string, z } from "zod";
import { conversationIdSchema } from "./conversation.schema.js";

export const joinConversationSchema = object({
    conversationId: conversationIdSchema,
});

export const leaveConversationSchema = object({
    conversationId: conversationIdSchema,
});

export const sendMessageSchema = object({
    conversationId: conversationIdSchema,
    content: string().min(1),
    type: z.enum(["text", "image"]).optional().default("text"),
});

export const startTypingSchema = object({
    conversationId: conversationIdSchema,
});

export const stopTypingSchema = object({
    conversationId: conversationIdSchema,
});
