import api from '@/services/api'
import type { PaginatedResponse, DoctorDto, DoctorDetailsDto, CreateDoctorDto } from '@/types'

export type DoctorsQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
}

export async function getDoctors(query: DoctorsQuery): Promise<PaginatedResponse<DoctorDto>> {
  const { data } = await api.get('/doctors', { params: query })
  return data
}

export async function getDoctorDetails(id: string): Promise<DoctorDetailsDto> {
  const { data } = await api.get(`/doctors/${id}`)
  return data
}

export async function createDoctor(dto: CreateDoctorDto): Promise<DoctorDto> {
  const { data } = await api.post('/doctors', dto)
  return data
}

export async function updateDoctor(id: string, dto: Partial<CreateDoctorDto>): Promise<DoctorDto> {
  const { data } = await api.put(`/doctors/${id}`, dto)
  return data
}

export async function deleteDoctor(id: string): Promise<void> {
  await api.delete(`/doctors/${id}`)
}
