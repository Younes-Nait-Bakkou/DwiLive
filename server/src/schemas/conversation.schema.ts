import { object, string, array, boolean, z } from "zod";
import { userIdSchema } from "./user.schema.js";
import { createPrefixedIdSchema } from "../utils/zod.js";

export const conversationIdSchema = createPrefixedIdSchema("conv", {
    invalidError: "Conversation ID is invalid",
    requiredError: "Conversation ID is required",
});

export const createConversationSchema = object({
    body: object({
        type: z.enum(["direct", "group"]),
        participants: array(userIdSchema).optional().default([]),
        name: string().optional(),
        isPrivate: boolean().optional().default(true),
    }).superRefine((data, ctx) => {
        if (data.type === "group" && !data.name) {
            ctx.addIssue({
                code: "custom",
                message: "Group name is required",
                path: ["name"],
            });
        }
        if (data.type === "direct" && data.participants?.length !== 1) {
            ctx.addIssue({
                code: "custom",
                message: "Direct chat requires exactly one other participant",
                path: ["participants"],
            });
        }
    }),
});

export type CreateConversationRequest = z.infer<typeof createConversationSchema>;

export const addMemberSchema = object({
    body: object({
        userId: userIdSchema,
    }),
    params: object({
        conversationId: conversationIdSchema,
    }),
});

export type AddMemberRequest = z.infer<typeof addMemberSchema>;

export const removeMemberSchema = object({
    params: object({
        conversationId: conversationIdSchema,
        userId: userIdSchema,
    }),
});

export type RemoveMemberRequest = z.infer<typeof removeMemberSchema>;

export const leaveConversationSchema = object({
    params: object({
        conversationId: conversationIdSchema,
    }),
});

export type LeaveConversationRequest = z.infer<typeof leaveConversationSchema>;

export const getMessagesSchema = object({
    params: object({
        conversationId: conversationIdSchema,
    }),
    query: object({
        limit: string().optional(),
        before: string().optional(),
    }),
});

export type GetMessagesRequest = z.infer<typeof getMessagesSchema>;
