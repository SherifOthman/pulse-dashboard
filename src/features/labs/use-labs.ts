import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLabs, createLab, updateLab, deleteLab } from './labs-api'
import type { LabsQuery } from './labs-api'
import type { CreateLabDto } from '@/types'

export function useLabs(query: LabsQuery) {
  return useQuery({
    queryKey: ['labs', query],
    queryFn: () => getLabs(query),
    placeholderData: (prev) => prev,
  })
}

export function useCreateLab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createLab,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labs'] }),
  })
}

export function useUpdateLab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateLabDto> }) => updateLab(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labs'] }),
  })
}

export function useDeleteLab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteLab,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labs'] }),
  })
}
