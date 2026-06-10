import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import type { GovernorateDto } from '@/features/cities/types'

export function useGovernorates(businessType?: number) {
  return useQuery<GovernorateDto[]>({
    queryKey: ['governorates', businessType],
    queryFn: async () => (await api.get('/governorates', { params: businessType ? { businessType } : undefined })).data,
  })
}
