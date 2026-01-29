import type { IConversation } from "../models/Conversation.js";
import type { IMessage } from "../models/Message.js";
import type { IUser } from "../models/User.js";
import type { ConversationDomain } from "@dwilive/shared/domains";
import { toPublicId } from "../utils/ids.js";
import { isPopulated } from "../utils/typeGuards.js";
import { MessageMapper, UserMapper } from "./index.js";

const _toConversationDTO = (
    conversation: IConversation,
    currentUserId: string,
): ConversationDomain.ConversationDTO => {
    let name = conversation.name;

    if (!name && conversation.type === "direct") {
        const partner = conversation.participants.find((p) => {
            if (p) {
                const pId = isPopulated<IUser>(p) ? p.id : p.toString();
                return pId !== currentUserId;
            }
            return false;
        });

        if (partner && isPopulated<IUser>(partner)) {
            name = partner.displayName || partner.username;
        }
    }

    if (conversation.lastMessage && !isPopulated(conversation.lastMessage)) {
        throw new Error(
            "Dev Error: 'lastMessage' is not populated. Check your Controller query.",
        );
    }

    if (conversation.admin && !isPopulated(conversation.admin)) {
        throw new Error(
            "Dev Error: 'admin' is not populated. Check your Controller query.",
        );
    }

    return {
        id: toPublicId("conv", conversation.id),
        type: conversation.type,
        name: name || "Unknown user",
        isPrivate: conversation.isPrivate,
        participants: conversation.participants
            .filter(isPopulated<IUser>)
            .map((p) => UserMapper.toUserDTO(p)),
        admin: conversation.admin
            ? UserMapper.toUserDTO(conversation.admin as IUser)
            : null,
        lastMessage: conversation.lastMessage
            ? MessageMapper.toMessageDTO(conversation.lastMessage as IMessage)
            : null,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
    };
};

export const toCreateConversationResponse = (
    conversation: IConversation,
    currentUserId: string,
): ConversationDomain.CreateConversationResponse => {
    return _toConversationDTO(conversation, currentUserId);
};
export const toGetConversationsResponse = (
    conversations: IConversation[],
    currentUserId: string,
): ConversationDomain.GetConversationsResponse => {
    return conversations.map((c) => _toConversationDTO(c, currentUserId));
};

export const toAddMemberResponse = (
    conversation: IConversation,
    currentUserId: string,
): ConversationDomain.AddMemberResponse => {
    return _toConversationDTO(conversation, currentUserId);
};

export const toRemoveMemberResponse = (
    conversation: IConversation,
    currentUserId: string,
): ConversationDomain.RemoveMemberResponse => {
    return _toConversationDTO(conversation, currentUserId);
};

export const toLeaveConversationResponse = (
    conversation: IConversation,
    currentUserId: string,
): ConversationDomain.LeaveConversationResponse => {
    return _toConversationDTO(conversation, currentUserId);
};

export const toGetMessagesResponse = (
    messages: IMessage[],
): ConversationDomain.GetMessagesResponse => {
    return messages.map((m) => MessageMapper.toMessageDTO(m));
};
