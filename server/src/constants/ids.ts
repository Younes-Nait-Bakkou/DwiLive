export const IdPrefix = {
    USER: "user",
    CONVERSATION: "conv",
    MESSAGE: "msg",
} as const;

export type IdPrefixType = (typeof IdPrefix)[keyof typeof IdPrefix];
