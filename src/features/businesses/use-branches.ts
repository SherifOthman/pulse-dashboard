import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateBranchDto } from '@/types/shared'
import type { createBranchApi } from './branches-api'

type BranchApi = ReturnType<typeof createBranchApi>

export function createBranchHooks(queryKey: string, branchApi: BranchApi) {
  const keys = {
    all: (businessId: string) => [queryKey, branchKeys, businessId] as const,
    detail: (businessId: string, id: string) => [queryKey, branchKeys, businessId, id] as const,
  }

  function useBranches(businessId: string | undefined) {
    return useQuery({
      queryKey: keys.all(businessId ?? ''),
      queryFn: () => branchApi.getBranches(businessId!),
      enabled: !!businessId,
    })
  }

  function invalidate(qc: ReturnType<typeof useQueryClient>, businessId: string) {
    qc.invalidateQueries({ queryKey: keys.all(businessId) })
    qc.invalidateQueries({ queryKey: [queryKey, 'detail', businessId] })
  }

  function useCreateBranch(businessId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (dto: CreateBranchDto) => branchApi.createBranch(businessId, dto),
      onSuccess: () => invalidate(qc, businessId),
    })
  }

  function useUpdateBranch(businessId: string, branchId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (dto: Partial<CreateBranchDto>) => branchApi.updateBranch(businessId, branchId, dto),
      onSuccess: () => invalidate(qc, businessId),
    })
  }

  function useDeleteBranch(businessId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (branchId: string) => branchApi.deleteBranch(businessId, branchId),
      onSuccess: () => invalidate(qc, businessId),
    })
  }

  return { keys, useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch }
}

const branchKeys = 'branches'
