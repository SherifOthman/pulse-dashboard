import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDoctors, getDoctorDetails, createDoctor, updateDoctor, deleteDoctor } from './doctors-api'
import type { DoctorsQuery } from './doctors-api'
import type { CreateDoctorDto } from '@/types'

export function useDoctors(query: DoctorsQuery) {
  return useQuery({
    queryKey: ['doctors', query],
    queryFn: () => getDoctors(query),
    placeholderData: (prev) => prev,
  })
}

export function useDoctorDetails(id: string | null) {
  return useQuery({
    queryKey: ['doctor-details', id],
    queryFn: () => getDoctorDetails(id!),
    enabled: !!id,
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctors'] }),
  })
}

export function useUpdateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateDoctorDto> }) =>
      updateDoctor(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctors'] }),
  })
}

export function useDeleteDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doctors'] }),
  })
}
