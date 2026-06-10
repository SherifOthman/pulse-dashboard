import api from '@/services/api'
import type { BranchListItem, BranchDetails, CreateBranchDto } from './types'

export async function getBranches(doctorId: string): Promise<BranchListItem[]> {
  const { data } = await api.get(`/doctors/${doctorId}/branches`)
  return data
}

export async function getBranchDetails(doctorId: string, id: string): Promise<BranchDetails> {
  const { data } = await api.get(`/doctors/${doctorId}/branches/${id}`)
  return data
}

export async function createBranch(
  doctorId: string,
  dto: CreateBranchDto,
): Promise<{ id: string; name: string }> {
  const { data } = await api.post(`/doctors/${doctorId}/branches`, dto)
  return data
}

export async function updateBranch(
  doctorId: string,
  id: string,
  dto: Partial<CreateBranchDto>,
): Promise<{ id: string; name: string }> {
  const { data } = await api.put(`/doctors/${doctorId}/branches/${id}`, dto)
  return data
}

export async function deleteBranch(doctorId: string, id: string): Promise<void> {
  await api.delete(`/doctors/${doctorId}/branches/${id}`)
}
