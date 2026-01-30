import type { ConversationDTO, TextMessageDTO } from "@dwilive/shared";

import { CURRENT_USER, MOCK_USERS } from "./users";

// Helper to generate a fake message ID
const genId = () => "msg_" + Math.random().toString(36).substring(2, 9);

// Helper to create a realistic "Last Message"
const createMockMessage = (
  content: string,
  senderIdx: number,
  conversationId: string,
): TextMessageDTO => ({
  id: genId(),
  type: "text",
  content,
  sender: MOCK_USERS[senderIdx], // 0 = DwiMaster, 1 = ReactFan, etc.
  metadata: null,
  conversationId,
  createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
});

export const MOCK_CONVERSATIONS: ConversationDTO[] = [
  // --- 1. A Public Group Chat ---
  {
    id: "c_general",
    type: "group",
    name: "General Hangout 🌍",
    isPrivate: false,
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    admin: MOCK_USERS[0], // DwiMaster is admin
    lastMessage: createMockMessage("Anyone watching the game?", 1, "c_general"),
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // --- 2. A Private Tech Group ---
  {
    id: "c_tech",
    type: "group",
    name: "Tech Talk 💻",
    isPrivate: true,
    participants: [MOCK_USERS[0], MOCK_USERS[2]], // Just Dwi & BackendPro
    admin: MOCK_USERS[2],
    lastMessage: createMockMessage(
      "Did you see the new Next.js update?",
      2,
      "c_tech",
    ),
    createdAt: new Date("2023-02-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // --- 3. A Direct Message (DM) ---
  {
    id: "c_dm_1",
    type: "direct",
    name: "ReactFan", // In DMs, the name is usually the other person
    isPrivate: true,
    participants: [CURRENT_USER, MOCK_USERS[1]],
    admin: null, // DMs have no admin
    lastMessage: createMockMessage("Hey, can you review my PR?", 1, "c_dm_1"),
    createdAt: new Date("2023-03-10").toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
