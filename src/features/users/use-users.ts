import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from './users-api'
import type { UpdateDashboardUserDto } from './types'

export function useUsers() {
  return useQuery({
    queryKey: ['dashboard-users'],
    queryFn: getUsers,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard-users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDashboardUserDto }) => updateUser(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard-users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard-users'] }),
  })
}
