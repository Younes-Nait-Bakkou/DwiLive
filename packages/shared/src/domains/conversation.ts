import { createPrefixedIdSchema, z } from "../utils/zod.js";
import type { MessageDTO } from "./message.js";
import { UserIdSchema, type UserDTO } from "./user.js";

// --- Types (DTOs) ---
export interface ConversationDTO {
  id: string;
  type: "direct" | "group";
  name: string;
  isPrivate: boolean;
  participants: UserDTO[];
  admin: UserDTO | null;
  lastMessage: MessageDTO | null;
  createdAt: string;
  updatedAt: string;
}

// --- Requests (Zod Schemas) ---
export const ConversationIdSchema = createPrefixedIdSchema("conv", {
  invalidError: "Conversation ID is invalid",
  requiredError: "Conversation ID is required",
});

export const CreateConversationSchema = z.object({
  body: z
    .object({
      type: z.enum(["direct", "group"]),
      participants: z.array(UserIdSchema).optional().default([]),
      name: z.string().optional(),
      isPrivate: z.boolean().optional().default(true),
    })
    .superRefine((data, ctx) => {
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

export const AddMemberSchema = z.object({
  body: z.object({
    userId: UserIdSchema,
  }),
  params: z.object({
    conversationId: ConversationIdSchema,
  }),
});

export const RemoveMemberSchema = z.object({
  params: z.object({
    conversationId: ConversationIdSchema,
    userId: UserIdSchema,
  }),
});

export const JoinConversationSchema = z.object({
  params: z.object({
    conversationId: ConversationIdSchema,
  }),
});

export const LeaveConversationSchema = z.object({
  params: z.object({
    conversationId: ConversationIdSchema,
  }),
});

export const GetMessagesSchema = z.object({
  params: z.object({
    conversationId: ConversationIdSchema,
  }),
  query: z.object({
    limit: z.string().optional(),
    before: z.string().optional(),
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
export type JoinConversationResponse = ConversationDTO;
export type GetMessagesResponse = MessageDTO[];
