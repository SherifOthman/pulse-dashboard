import api from '@/services/api'
import type { CityDto, CreateCityDto } from '@/types'

export async function getCities(governorateId?: string): Promise<CityDto[]> {
  const params = governorateId ? { governorateId } : {}
  const { data } = await api.get('/cities', { params })
  return data
}

export async function createCity(dto: CreateCityDto): Promise<CityDto> {
  const { data } = await api.post('/cities', dto)
  return data
}

export async function updateCity(id: string, dto: Partial<CreateCityDto>): Promise<CityDto> {
  const { data } = await api.put(`/cities/${id}`, dto)
  return data
}

export async function deleteCity(id: string): Promise<void> {
  await api.delete(`/cities/${id}`)
}
