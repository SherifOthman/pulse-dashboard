import api from '@/services/api'
import type { PaginatedResponse } from '@/types/shared'
import type { LabDto, CreateLabDto } from './types'

export type LabsQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
}

export async function getLabs(query: LabsQuery): Promise<PaginatedResponse<LabDto>> {
  const { data } = await api.get('/labs', { params: query })
  return data
}

export async function createLab(dto: CreateLabDto): Promise<LabDto> {
  const { data } = await api.post('/labs', dto)
  return data
}

export async function updateLab(id: string, dto: Partial<CreateLabDto>): Promise<LabDto> {
  const { data } = await api.put(`/labs/${id}`, dto)
  return data
}

export async function deleteLab(id: string): Promise<void> {
  await api.delete(`/labs/${id}`)
}
