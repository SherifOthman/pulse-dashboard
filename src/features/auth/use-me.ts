import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/auth-store'
import { fetchMe } from './auth-api'
import type { UserInfo } from '@/types'

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery<UserInfo>({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
  })
}
