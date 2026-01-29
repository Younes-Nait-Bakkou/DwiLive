import type { IMessage } from "../models/Message.js";
import type { IUser } from "../models/User.js";
import type { MessageDomain } from "@dwilive/shared/domains";
import { toPublicId } from "../utils/ids.js";
import { isPopulated } from "../utils/typeGuards.js";
import { UserMapper } from "./index.js";

export const toMessageDTO = (message: IMessage): MessageDomain.MessageDTO => {
    const conversationId = toPublicId("conv", message.conversation);

    const base = {
        id: toPublicId("msg", message.id),
        conversationId: conversationId,
        createdAt: message.createdAt.toISOString(),
    };

    if (message.type === "system" && message.metadata) {
        return {
            ...base,
            type: "system",
            sender: null,
            content: message.content,
            metadata: message.metadata,
        } as MessageDomain.SystemMessageDTO;
    }

    if (!message.sender || !isPopulated<IUser>(message.sender)) {
        throw new Error(`Message ${message.id} has no populated sender!`);
    }

    return {
        ...base,
        type: message.type as "text" | "image",
        content: message.content,
        sender: UserMapper.toUserDTO(message.sender),
        metadata: null,
    };
};
