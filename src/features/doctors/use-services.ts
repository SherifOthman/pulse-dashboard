import { useQuery } from '@tanstack/react-query'
import { getAvailableServices, getDoctorServices } from './services-api'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const serviceKeys = {
  available: ['doctor-services-available'] as const,
  doctor:    (doctorId: string) => ['doctor-services', doctorId] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

/** All Doctor-typed services in the system — used to populate the picker. */
export function useAvailableServices() {
  return useQuery({
    queryKey: serviceKeys.available,
    queryFn:  getAvailableServices,
    staleTime: 5 * 60 * 1000,
  })
}

/** Services currently linked to a specific doctor. */
export function useDoctorServices(doctorId: string | null) {
  return useQuery({
    queryKey: serviceKeys.doctor(doctorId ?? ''),
    queryFn:  () => getDoctorServices(doctorId!),
    enabled:  !!doctorId,
  })
}
