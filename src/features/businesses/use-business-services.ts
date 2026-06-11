/**
 * useBusinessServices / useUpdateBusinessServices
 *
 * Generic React Query hooks for managing services on any business type.
 * Used by Pharmacy, Lab, and Radiology (not Doctor — that has its own hooks).
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAvailableBusinessServices,
  getBusinessServices,
  updateBusinessServices,
  type BusinessServiceItem,
} from './business-services-api'

export const businessServiceKeys = {
  available: (segment: string) => ['business-services-available', segment] as const,
  linked:    (segment: string, id: string) => ['business-services', segment, id] as const,
}

export function useAvailableBusinessServices(segment: string) {
  return useQuery({
    queryKey:  businessServiceKeys.available(segment),
    queryFn:   () => getAvailableBusinessServices(segment),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLinkedBusinessServices(segment: string, businessId: string | null) {
  return useQuery({
    queryKey: businessServiceKeys.linked(segment, businessId ?? ''),
    queryFn:  () => getBusinessServices(segment, businessId!),
    enabled:  !!businessId,
  })
}

/** Returns a persist function — not a useMutation, to avoid stale-state issues */
export function useBusinessServicesPersist(segment: string, businessId: string) {
  const qc = useQueryClient()

  return async (services: BusinessServiceItem[]) => {
    const result = await updateBusinessServices(segment, businessId, services)
    // Update cache directly with server response
    qc.setQueryData(
      businessServiceKeys.linked(segment, businessId),
      result.services,
    )
    qc.invalidateQueries({ queryKey: businessServiceKeys.available(segment) })
    return result
  }
}
