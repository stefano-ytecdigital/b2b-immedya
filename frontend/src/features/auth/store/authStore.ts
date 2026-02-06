import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateAccessToken: (token: string) => void;
  updateUser: (user: User) => void;
}

/**
 * Zustand auth store with persistence
 * Persists user and refreshToken to localStorage
 * Access token is NOT persisted (expires in 15min)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateAccessToken: (token) =>
        set({ accessToken: token }),

      updateUser: (user) =>
        set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist accessToken (short-lived)
      }),
    }
  )
);
