import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBranches,
  getBranchDetails,
  createBranch,
  updateBranch,
  deleteBranch,
} from './branches-api'
import { doctorKeys } from './use-doctors'
import type { CreateBranchDto } from './types'

// ── Query keys ─────────────────────────────────────────────────────────────────

export const branchKeys = {
  all: (doctorId: string) => ['branches', doctorId] as const,
  detail: (doctorId: string, id: string) => ['branches', doctorId, id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useBranches(doctorId: string | undefined) {
  return useQuery({
    queryKey: branchKeys.all(doctorId ?? ''),
    queryFn: () => getBranches(doctorId!),
    enabled: !!doctorId,
  })
}

export function useBranchDetails(doctorId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: branchKeys.detail(doctorId ?? '', id ?? ''),
    queryFn: () => getBranchDetails(doctorId!, id!),
    enabled: !!doctorId && !!id,
  })
}

function invalidateBranches(qc: ReturnType<typeof useQueryClient>, doctorId: string) {
  qc.invalidateQueries({ queryKey: branchKeys.all(doctorId) })
  // Also invalidate doctor details so branch count updates
  qc.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) })
}

export function useCreateBranch(doctorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateBranchDto) => createBranch(doctorId, dto),
    onSuccess: () => invalidateBranches(qc, doctorId),
  })
}

export function useUpdateBranch(doctorId: string, branchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: Partial<CreateBranchDto>) => updateBranch(doctorId, branchId, dto),
    onSuccess: () => invalidateBranches(qc, doctorId),
  })
}

export function useDeleteBranch(doctorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (branchId: string) => deleteBranch(doctorId, branchId),
    onSuccess: () => invalidateBranches(qc, doctorId),
  })
}
