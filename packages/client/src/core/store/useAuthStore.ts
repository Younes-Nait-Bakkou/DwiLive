import { create } from "zustand";

import type { UserDTO } from "@dwilive/shared";

import { CURRENT_USER } from "@/core/mocks";

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
  user: CURRENT_USER,
  token: "mock-jwt-token",
  isAuthenticated: true,

  login: (user, token) => set({ user, token, isAuthenticated: true }),

  logout: () => set({ user: null, token: null, isAuthenticated: false }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
