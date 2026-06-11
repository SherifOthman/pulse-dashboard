import { QueryClientProvider } from '@tanstack/react-query'
import { Toast } from '@heroui/react'
import { queryClient } from '@/services/query-client'

type Props = { children: React.ReactNode }

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider placement="bottom end" />
      {children}
    </QueryClientProvider>
  )
}
