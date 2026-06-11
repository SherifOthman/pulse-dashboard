import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useState, useEffect } from 'react'
import type { AuthTokens } from '@/features/auth/types'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setSession: (tokens: AuthTokens) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
          isAuthenticated: true,
        }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    },
  ),
)

export function useHydrated() {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])
  return hydrated
}