import api from '@/services/api'
import type { PaginatedResponse } from '@/types/shared'
import type { DoctorDetailsDto, CreateDoctorDto, DoctorListItem } from './types'

// ── Query params ───────────────────────────────────────────────────────────────

export type DoctorsQuery = {
  page?: number
  pageSize?: number
  name?: string
  governorateId?: string
  cityId?: string
  specializationId?: string
  gender?: number
  sortBy?: string
  sortDirection?: string
}

// ── API functions ──────────────────────────────────────────────────────────────

export async function getDoctors(query: DoctorsQuery): Promise<PaginatedResponse<DoctorListItem>> {
  const { data } = await api.get('/doctors', { params: query })
  return data
}

export async function getDoctorDetails(id: string): Promise<DoctorDetailsDto> {
  const { data } = await api.get(`/doctors/${id}`)
  return data
}

export async function createDoctor(dto: CreateDoctorDto): Promise<{ id: string; name: string }> {
  const { data } = await api.post('/doctors', dto)
  return data
}

export async function updateDoctor(id: string, dto: Partial<CreateDoctorDto>): Promise<{ id: string; name: string }> {
  const { data } = await api.put(`/doctors/${id}`, dto)
  return data
}

export async function deleteDoctor(id: string): Promise<void> {
  await api.delete(`/doctors/${id}`)
}
