/**
 * createBusinessHooks
 *
 * Factory that produces typed React Query hooks for any simple business type.
 * Usage:
 *   export const { useList, useDetails, useCreate, useUpdate, useDelete } =
 *     createBusinessHooks('pharmacies', pharmacyApi)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BusinessQuery, createBusinessApi } from './business-api'
import type { CreateBusinessDto } from '@/types/shared'

type BusinessApi = ReturnType<typeof createBusinessApi>

export function createBusinessHooks(queryKey: string, businessApi: BusinessApi) {
  const keys = {
    all:    [queryKey] as const,
    list:   (q: BusinessQuery) => [queryKey, 'list', q] as const,
    detail: (id: string | null) => [queryKey, 'detail', id] as const,
  }

  function useList(query: BusinessQuery) {
    return useQuery({
      queryKey: keys.list(query),
      queryFn:  () => businessApi.getList(query),
      placeholderData: (prev) => prev,
    })
  }

  function useDetails(id: string | null) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn:  () => businessApi.getDetails(id!),
      enabled:  !!id,
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (dto: CreateBusinessDto) => businessApi.create(dto),
      onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateBusinessDto> }) =>
        businessApi.update(id, dto),
      onSuccess: (_data, { id }) => {
        qc.invalidateQueries({ queryKey: keys.all })
        qc.invalidateQueries({ queryKey: keys.detail(id) })
      },
    })
  }

  function useDelete() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => businessApi.remove(id),
      onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  return { keys, useList, useDetails, useCreate, useUpdate, useDelete }
}
