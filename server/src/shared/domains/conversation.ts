import { object, string, array, boolean, z } from "zod";
import { createPrefixedIdSchema } from "../../shared/utils/zod.js";
import { UserIdSchema } from "./user.js";
import type { MessageDomain, UserDomain } from "./index.js";

// --- Types (DTOs) ---
export interface ConversationDTO {
    id: string;
    type: "direct" | "group";
    name: string;
    isPrivate: boolean;
    participants: UserDomain.UserDTO[];
    admin: UserDomain.UserDTO | null;
    lastMessage: MessageDomain.MessageDTO | null;
    createdAt: string;
    updatedAt: string;
}

// --- Requests (Zod Schemas) ---
export const ConversationIdSchema = createPrefixedIdSchema("conv", {
    invalidError: "Conversation ID is invalid",
    requiredError: "Conversation ID is required",
});

export const CreateConversationSchema = object({
    body: object({
        type: z.enum(["direct", "group"]),
        participants: array(UserIdSchema).optional().default([]),
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

export const AddMemberSchema = object({
    body: object({
        userId: UserIdSchema,
    }),
    params: object({
        conversationId: ConversationIdSchema,
    }),
});

export const RemoveMemberSchema = object({
    params: object({
        conversationId: ConversationIdSchema,
        userId: UserIdSchema,
    }),
});

export const JoinConversationSchema = object({
    params: object({
        conversationId: ConversationIdSchema,
    }),
});

export const LeaveConversationSchema = object({
    params: object({
        conversationId: ConversationIdSchema,
    }),
});

export const GetMessagesSchema = object({
    params: object({
        conversationId: ConversationIdSchema,
    }),
    query: object({
        limit: string().optional(),
        before: string().optional(),
    }),
});

export type CreateConversationBody = z.infer<
    typeof CreateConversationSchema
>["body"];

export type AddMemberBody = z.infer<typeof AddMemberSchema>["body"];
export type AddMemberParams = z.infer<typeof AddMemberSchema>["params"];

export type RemoveMemberParams = z.infer<typeof RemoveMemberSchema>["params"];

export type JoinConversationParams = z.infer<
    typeof JoinConversationSchema
>["params"];
export type LeaveConversationParams = z.infer<
    typeof LeaveConversationSchema
>["params"];

export type GetMessagesParams = z.infer<typeof GetMessagesSchema>["params"];
export type GetMessagesQuery = z.infer<typeof GetMessagesSchema>["query"];

// --- Responses ---
export type CreateConversationResponse = ConversationDTO;
export type GetConversationsResponse = ConversationDTO[];
export type AddMemberResponse = ConversationDTO;
export type RemoveMemberResponse = ConversationDTO;
export type LeaveConversationResponse = ConversationDTO;
export type GetMessagesResponse = MessageDomain.MessageDTO[];
