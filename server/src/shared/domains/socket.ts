import { object, string, z } from "zod";
import { ConversationIdSchema } from "./conversation.js";

export const joinConversationSchema = object({
    conversationId: ConversationIdSchema,
});

export const leaveConversationSchema = object({
    conversationId: ConversationIdSchema,
});

export const sendMessageSchema = object({
    conversationId: ConversationIdSchema,
    content: string().min(1),
    type: z.enum(["text", "image"]).optional().default("text"),
});

export const startTypingSchema = object({
    conversationId: ConversationIdSchema,
});

export const stopTypingSchema = object({
    conversationId: ConversationIdSchema,
});

export type JoinConversationRequest = z.infer<typeof joinConversationSchema>;
export type LeaveConversationRequest = z.infer<typeof leaveConversationSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export type StartTypingRequest = z.infer<typeof startTypingSchema>;
export type StopTypingRequest = z.infer<typeof stopTypingSchema>;
