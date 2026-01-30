import { create } from "zustand";
import { UserDTO } from "@dwilive/shared";
import { MOCK_USERS } from "@/core/mocks"; // Import mock for initial dev state

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: UserDTO, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserDTO>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ⚠️ DEV MODE: Start with a mock user logged in so you can build the UI
  // In production, this would start as null.
  user: MOCK_USERS[0], 
  token: "mock-jwt-token",
  isAuthenticated: true,

  login: (user, token) => set({ user, token, isAuthenticated: true }),
  
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  
  updateUser: (updates) => 
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
