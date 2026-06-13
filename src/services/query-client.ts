import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // The axios interceptor already handles 401 → refresh → retry for us.
      // React Query retrying on top of that causes race conditions where a
      // second request fires before the refresh completes, sees a stale token,
      // gets another 401, and triggers a second (failed) refresh attempt.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})
