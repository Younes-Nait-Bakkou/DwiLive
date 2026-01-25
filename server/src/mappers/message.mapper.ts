import type { IMessage } from "../models/Message.js";
import type { MessageDomain } from "../shared/domains/index.js";

export const toMessageDTO = (message: IMessage): MessageDomain.MessageDTO => {
    return {
        id: message.id,
        conversationId: message.conversation?.toString() || "",
        senderId: message.sender?.toString() || "",
        content: message.content,
        type: message.type,
        createdAt: message.createdAt.toISOString(),
    };
};
