import type { SystemMessageType } from "../constants/system-messages.js";
import type { UserDTO } from "./user.js";

export type UserJoinedMetadata = {
  userId: string;
  username: string;
};

export type GroupRenamedMetadata = {
  adminName: string;
  oldName: string;
  newName: string;
};

export type MemberAddedMetadata = {
  adminName: string;
  addedUserName: string;
};

export type SystemMessageDTO =
  | {
      id: string;
      type: "system";
      conversationId: string;
      sender: null;
      content: SystemMessageType.USER_JOINED;
      metadata: UserJoinedMetadata;
      createdAt: string;
    }
  | {
      id: string;
      type: "system";
      conversationId: string;
      sender: null;
      content: SystemMessageType.GROUP_RENAMED;
      metadata: GroupRenamedMetadata;
      createdAt: string;
    }
  | {
      id: string;
      type: "system";
      conversationId: string;
      sender: null;
      content: SystemMessageType.MEMBER_ADDED;
      metadata: MemberAddedMetadata;
      createdAt: string;
    };

export interface TextMessageDTO {
  id: string;
  type: "text" | "image";
  content: string;
  sender: UserDTO;
  metadata: null;
  conversationId: string;
  createdAt: string;
}

export type MessageDTO = TextMessageDTO | SystemMessageDTO;
