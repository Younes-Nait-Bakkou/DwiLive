import { object, string, z } from "zod";
import { ConversationIdSchema } from "./conversation.js";

export const joinConversationRoomSchema = object({
    conversationId: ConversationIdSchema,
});

export const leaveConversationRoomSchema = object({
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

export type JoinConversationRoomPayload = z.infer<
    typeof joinConversationRoomSchema
>;
export type LeaveConversationRoomPayload = z.infer<
    typeof leaveConversationRoomSchema
>;
export type SendMessagePayload = z.infer<typeof sendMessageSchema>;
export type StartTypingPayload = z.infer<typeof startTypingSchema>;
export type StopTypingPayload = z.infer<typeof stopTypingSchema>;
