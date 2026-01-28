import { z } from "../utils/zod.js";
import { ConversationIdSchema } from "./conversation.js";

export const joinConversationRoomSchema = z.object({
    conversationId: ConversationIdSchema,
});

export const leaveConversationRoomSchema = z.object({
    conversationId: ConversationIdSchema,
});

export const sendMessageSchema = z.object({
    conversationId: ConversationIdSchema,
    content: z.string().min(1),
    type: z.enum(["text", "image"]).optional().default("text"),
});

export const startTypingSchema = z.object({
    conversationId: ConversationIdSchema,
});

export const stopTypingSchema = z.object({
    conversationId: ConversationIdSchema,
});

export type JoinConversationRoomPayload = z.infer<
    typeof joinConversationRoomSchema
>;
export type LeaveConversationRoomPayload = z.infer<
    typeof leaveConversationRoomSchema
>;
export type SendMessagePayload = z.infer<typeof sendMessageSchema>;
export type StartTypingPayload = z.infer<typeof startTypingSchema>;
export type StopTypingPayload = z.infer<typeof stopTypingSchema>;
