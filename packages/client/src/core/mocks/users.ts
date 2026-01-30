import type { UserDTO } from "@dwilive/shared";

export const MOCK_USERS: UserDTO[] = [
  {
    id: "u1",
    username: "DwiMaster",
    displayName: "Dwi Master",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dwi",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "u2",
    username: "ReactFan",
    displayName: "React Fan",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=React",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CURRENT_USER: UserDTO = MOCK_USERS[0];
