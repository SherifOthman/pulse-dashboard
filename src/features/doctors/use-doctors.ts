import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDoctors,
  getDoctorDetails,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from './doctors-api'
import type { DoctorsQuery } from './doctors-api'
import type { CreateDoctorDto } from './types'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const doctorKeys = {
  all: ['doctors'] as const,
  list: (query: DoctorsQuery) => ['doctors', 'list', query] as const,
  detail: (id: string | null) => ['doctors', 'detail', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useDoctors(query: DoctorsQuery) {
  return useQuery({
    queryKey: doctorKeys.list(query),
    queryFn: () => getDoctors(query),
    placeholderData: (prev) => prev,
  })
}

export function useDoctorDetails(id: string | null) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => getDoctorDetails(id!),
    enabled: !!id,
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorKeys.all }),
  })
}

export function useUpdateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateDoctorDto> }) =>
      updateDoctor(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: doctorKeys.all })
      qc.invalidateQueries({ queryKey: doctorKeys.detail(id) })
    },
  })
}

export function useDeleteDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorKeys.all }),
  })
}
