import api from '@/services/api'
import type { PaginatedResponse, PharmacyDto, CreatePharmacyDto } from '@/types'

export type PharmaciesQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
}

export async function getPharmacies(query: PharmaciesQuery): Promise<PaginatedResponse<PharmacyDto>> {
  const { data } = await api.get('/pharmacies', { params: query })
  return data
}

export async function createPharmacy(dto: CreatePharmacyDto): Promise<PharmacyDto> {
  const { data } = await api.post('/pharmacies', dto)
  return data
}

export async function updatePharmacy(id: string, dto: Partial<CreatePharmacyDto>): Promise<PharmacyDto> {
  const { data } = await api.put(`/pharmacies/${id}`, dto)
  return data
}

export async function deletePharmacy(id: string): Promise<void> {
  await api.delete(`/pharmacies/${id}`)
}
