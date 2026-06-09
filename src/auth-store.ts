import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens } from '@/types'

type AuthState = {
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (tokens: AuthTokens) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      setSession: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          isAuthenticated: true,
        }),

      clearSession: () =>
        set({
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'auth-storage' },
  ),
)
