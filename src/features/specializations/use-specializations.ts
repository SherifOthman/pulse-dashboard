import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization } from './specializations-api'
import type { CreateSpecializationDto } from '@/types'

export function useSpecializations() {
  return useQuery({
    queryKey: ['specializations'],
    queryFn: getSpecializations,
  })
}

export function useCreateSpecialization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSpecialization,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  })
}

export function useUpdateSpecialization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateSpecializationDto> }) =>
      updateSpecialization(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  })
}

export function useDeleteSpecialization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteSpecialization,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializations'] }),
  })
}
