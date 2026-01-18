import { object, string, array, boolean, z } from "zod";
import { userIdSchema } from "./user.schema.js";
import { createPrefixedIdSchema } from "../utils/zod.js";

export const roomIdSchema = createPrefixedIdSchema("room", {
    invalidError: "Room ID is invalid",
    requiredError: "Room ID is required",
});

export const createRoomSchema = object({
    body: object({
        type: z.enum(["direct", "group"], {
            error: "Type is required",
        }),
        participants: array(userIdSchema).optional().default([]),
        name: string().optional(),
        isPrivate: boolean(),
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

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;

export const addMemberSchema = object({
    body: object({
        userId: userIdSchema,
    }),
    params: object({
        roomId: roomIdSchema,
    }),
});

export type AddMemberRequest = z.infer<typeof addMemberSchema>;

export const removeMemberSchema = object({
    params: object({
        roomId: roomIdSchema,
        userId: userIdSchema,
    }),
});

export type RemoveMemberRequest = z.infer<typeof removeMemberSchema>;

export const leaveRoomSchema = object({
    params: object({
        roomId: roomIdSchema,
    }),
});

export type LeaveRoomRequest = z.infer<typeof leaveRoomSchema>;

export const getMessagesSchema = object({
    params: object({
        roomId: roomIdSchema,
    }),
    query: object({
        limit: string().optional(),
        before: string().optional(),
    }),
});

export type GetMessagesRequest = z.infer<typeof getMessagesSchema>;
