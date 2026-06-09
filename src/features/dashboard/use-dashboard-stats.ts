import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export type DashboardStats = {
  doctorsCount: number
  pharmaciesCount: number
  labsCount: number
  radiologyCount: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/dashboard/stats')
      return data
    },
  })
}
