import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export type TopDoctorDto = {
  id: string
  name: string
  profileImageUrl: string | null
  specialization: string
  governorate: string
  averageRating: number
  totalRatings: number
  visitPrice: number | null
}

export type RecentDoctorDto = {
  id: string
  name: string
  profileImageUrl: string | null
  specialization: string
  governorate: string
  visitPrice: number | null
  gender: number
}

export type SpecializationStatDto = {
  name: string
  count: number
}

export type GovernorateStatDto = {
  name: string
  count: number
}

export type DashboardStats = {
  doctorsCount: number
  pharmaciesCount: number
  labsCount: number
  radiologyCount: number
  branchesCount: number
  specializationsCount: number
  citiesCount: number
  topRatedDoctors: TopDoctorDto[]
  recentDoctors: RecentDoctorDto[]
  specializationStats: SpecializationStatDto[]
  governorateStats: GovernorateStatDto[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/stats')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 min — dashboard data doesn't need to be live
  })
}
