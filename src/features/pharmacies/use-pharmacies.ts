import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPharmacies, createPharmacy, updatePharmacy, deletePharmacy } from './pharmacies-api'
import type { PharmaciesQuery } from './pharmacies-api'
import type { CreatePharmacyDto } from './types'

export function usePharmacies(query: PharmaciesQuery) {
  return useQuery({
    queryKey: ['pharmacies', query],
    queryFn: () => getPharmacies(query),
    placeholderData: (prev) => prev,
  })
}

export function useCreatePharmacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPharmacy,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacies'] }),
  })
}

export function useUpdatePharmacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreatePharmacyDto> }) =>
      updatePharmacy(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacies'] }),
  })
}

export function useDeletePharmacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePharmacy,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacies'] }),
  })
}
