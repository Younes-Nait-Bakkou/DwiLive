import type { ConversationDTO, TextMessageDTO } from "@dwilive/shared";

import { CURRENT_USER, MOCK_USERS } from "./users";

const genId = () => "msg_" + Math.random().toString(36).substring(2, 9);

const createMockMessage = (
  content: string,
  senderIdx: number,
  conversationId: string,
): TextMessageDTO => ({
  id: genId(),
  type: "text",
  content,
  sender: MOCK_USERS[senderIdx],
  metadata: null,
  conversationId,
  createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
});

export const MOCK_CONVERSATIONS: ConversationDTO[] = [
  // --- A Public Group Chat ---
  {
    id: "c_general",
    type: "group",
    name: "General Hangout 🌍",
    isPrivate: false,
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    admin: MOCK_USERS[0],
    lastMessage: createMockMessage("Anyone watching the game?", 1, "c_general"),
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ---  A Private Tech Group ---
  {
    id: "c_tech",
    type: "group",
    name: "Tech Talk 💻",
    isPrivate: true,
    participants: [MOCK_USERS[0], MOCK_USERS[2]],
    admin: MOCK_USERS[2],
    lastMessage: createMockMessage(
      "Did you see the new Next.js update?",
      2,
      "c_tech",
    ),
    createdAt: new Date("2023-02-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ---  A Direct Message (DM) ---
  {
    id: "c_dm_1",
    type: "direct",
    name: "ReactFan",
    isPrivate: true,
    participants: [CURRENT_USER, MOCK_USERS[1]],
    admin: null,
    lastMessage: createMockMessage("Hey, can you review my PR?", 1, "c_dm_1"),
    createdAt: new Date("2023-03-10").toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
