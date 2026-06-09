import api from '@/services/api'
import type { SpecializationDto, CreateSpecializationDto } from '@/types'

export async function getSpecializations(): Promise<SpecializationDto[]> {
  const { data } = await api.get('/specializations')
  return data
}

export async function createSpecialization(dto: CreateSpecializationDto): Promise<SpecializationDto> {
  const { data } = await api.post('/specializations', dto)
  return data
}

export async function updateSpecialization(id: string, dto: Partial<CreateSpecializationDto>): Promise<SpecializationDto> {
  const { data } = await api.put(`/specializations/${id}`, dto)
  return data
}

export async function deleteSpecialization(id: string): Promise<void> {
  await api.delete(`/specializations/${id}`)
}
