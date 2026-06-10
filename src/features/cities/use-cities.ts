import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCities, createCity, updateCity, deleteCity } from './cities-api'
import type { CreateCityDto } from './types'

export function useCities(governorateId?: string) {
  return useQuery({
    queryKey: ['cities', governorateId ?? 'all'],
    queryFn: () => getCities(governorateId),
  })
}

export function useCreateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  })
}

export function useUpdateCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateCityDto> }) => updateCity(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  })
}

export function useDeleteCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  })
}
