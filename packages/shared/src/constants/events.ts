import { SocketEvent } from "./socket-events.js";
import type { EventCallback } from "../types/socket.js";
import type { MessageDomain, UserDomain } from "../domains/index.js";
import type {
  SendMessagePayload,
  StartTypingPayload,
  StopTypingPayload,
} from "../domains/socket.js";

// --- 1. SERVER -> CLIENT (Strict DTOs for React State) ---
export interface ServerToClientEvents {
  /**
   * Triggered when ANY message is created (Text, Image, OR System).
   * Frontend: Append to message list.
   */
  [SocketEvent.Server.RECEIVE_MESSAGE]: (
    message: MessageDomain.MessageDTO,
  ) => void;

  /**
   * Triggered when a user joins voluntarily via link.
   * Frontend: Add user to 'participants' list.
   */
  [SocketEvent.Server.USER_JOINED_CONVERSATION]: (data: {
    conversationId: string;
    user: UserDomain.UserDTO;
  }) => void;

  /**
   * Triggered when a user leaves voluntarily.
   * Frontend: Remove user from 'participants' list.
   */
  [SocketEvent.Server.USER_LEFT_CONVERSATION]: (data: {
    conversationId: string;
    userId: string;
  }) => void;

  /**
   * Triggered when an admin adds a new member.
   * Frontend: Add user to 'participants' list (and maybe show toast).
   */
  [SocketEvent.Server.MEMBER_ADDED_TO_CONVERSATION]: (data: {
    conversationId: string;
    addedUser: UserDomain.UserDTO;
    adminId: string; // Context for UI (optional)
  }) => void;

  /**
   * Triggered when an admin kicks a member.
   * Frontend: If current user == kickedUserId -> Redirect home. Else -> Remove from list.
   */
  [SocketEvent.Server.MEMBER_KICKED_FROM_CONVERSATION]: (data: {
    conversationId: string;
    kickedUserId: string;
    adminId: string;
  }) => void;

  /**
   * Triggered for typing indicators.
   * Frontend: Show "User is typing..." dots.
   */
  [SocketEvent.Server.DISPLAY_TYPING]: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
}

// --- 2. CLIENT -> SERVER (Validated Payloads) ---
export interface ClientToServerEvents {
  /**
   * User wants to send a message.
   */
  [SocketEvent.Client.SEND_MESSAGE]: (
    payload: SendMessagePayload,
    callback?: EventCallback, // Callback is optional but good for Ack
  ) => void;

  /**
   * User opens a chat room (subscribes to updates).
   * Payload: usually just { conversationId }
   */
  [SocketEvent.Client.JOIN_CONVERSATION]: (
    payload: { conversationId: string },
    callback?: EventCallback,
  ) => void;

  /**
   * User leaves a chat room (unsubscribes).
   */
  [SocketEvent.Client.LEAVE_CONVERSATION]: (
    payload: { conversationId: string },
    callback?: EventCallback,
  ) => void;

  /**
   * User starts typing.
   */
  [SocketEvent.Client.TYPING_START]: (
    payload: StartTypingPayload,
    callback?: EventCallback,
  ) => void;

  /**
   * User stops typing.
   */
  [SocketEvent.Client.TYPING_STOP]: (
    payload: StopTypingPayload,
    callback?: EventCallback,
  ) => void;
}
