import api from '@/services/api'
import type { PaginatedResponse, RadiologyDto, CreateRadiologyDto } from '@/types'

export type RadiologyQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
}

export async function getRadiology(query: RadiologyQuery): Promise<PaginatedResponse<RadiologyDto>> {
  const { data } = await api.get('/radiology', { params: query })
  return data
}

export async function createRadiology(dto: CreateRadiologyDto): Promise<RadiologyDto> {
  const { data } = await api.post('/radiology', dto)
  return data
}

export async function updateRadiology(id: string, dto: Partial<CreateRadiologyDto>): Promise<RadiologyDto> {
  const { data } = await api.put(`/radiology/${id}`, dto)
  return data
}

export async function deleteRadiology(id: string): Promise<void> {
  await api.delete(`/radiology/${id}`)
}
