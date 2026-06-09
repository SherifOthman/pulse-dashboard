import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRadiology, createRadiology, updateRadiology, deleteRadiology } from './radiology-api'
import type { RadiologyQuery } from './radiology-api'
import type { CreateRadiologyDto } from '@/types'

export function useRadiology(query: RadiologyQuery) {
  return useQuery({
    queryKey: ['radiology', query],
    queryFn: () => getRadiology(query),
    placeholderData: (prev) => prev,
  })
}

export function useCreateRadiology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRadiology,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radiology'] }),
  })
}

export function useUpdateRadiology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateRadiologyDto> }) => updateRadiology(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radiology'] }),
  })
}

export function useDeleteRadiology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteRadiology,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['radiology'] }),
  })
}
