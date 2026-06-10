import api from '@/services/api'
import type { DashboardUser, CreateDashboardUserDto, UpdateDashboardUserDto } from './types'

export async function getUsers(): Promise<DashboardUser[]> {
  const { data } = await api.get('/admin/users')
  return data
}

export async function createUser(dto: CreateDashboardUserDto): Promise<DashboardUser> {
  const { data } = await api.post('/admin/users', dto)
  return data
}

export async function updateUser(id: string, dto: UpdateDashboardUserDto): Promise<DashboardUser> {
  const { data } = await api.put(`/admin/users/${id}`, dto)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}
