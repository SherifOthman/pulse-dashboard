/**
 * createBusinessApi
 *
 * Factory that produces typed CRUD functions for any simple business type
 * (Pharmacy, Lab, Radiology). Doctor has its own API due to extra fields.
 */
import api from '@/services/api'
import type {
  PaginatedResponse,
  BusinessListItem,
  BusinessDetailsDto,
  CreateBusinessDto,
} from '@/types/shared'

export type BusinessQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
  cityId?: string
  sortBy?: string
  sortDirection?: string
}

export function createBusinessApi(segment: string) {
  return {
    async getList(query: BusinessQuery): Promise<PaginatedResponse<BusinessListItem>> {
      const { data } = await api.get(`/${segment}`, { params: query })
      return data
    },

    async getDetails(id: string): Promise<BusinessDetailsDto> {
      const { data } = await api.get(`/${segment}/${id}`)
      return data
    },

    async create(dto: CreateBusinessDto): Promise<{ id: string; name: string }> {
      const { data } = await api.post(`/${segment}`, dto)
      return data
    },

    async update(id: string, dto: Partial<CreateBusinessDto>): Promise<{ id: string; name: string }> {
      const { data } = await api.put(`/${segment}/${id}`, dto)
      return data
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/${segment}/${id}`)
    },
  }
}

// ── Pre-built instances ────────────────────────────────────────────────────────
export const pharmacyApi   = createBusinessApi('pharmacies')
export const labApi        = createBusinessApi('labs')
export const radiologyApi  = createBusinessApi('radiology')
