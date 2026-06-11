import api from '@/services/api'
import type { BranchListItem, BranchDetails, CreateBranchDto } from '@/types/shared'

export function createBranchApi(segment: string) {
  return {
    getBranches(businessId: string): Promise<BranchListItem[]> {
      return api.get(`/${segment}/${businessId}/branches`).then((r) => r.data)
    },
    getBranchDetails(businessId: string, id: string): Promise<BranchDetails> {
      return api.get(`/${segment}/${businessId}/branches/${id}`).then((r) => r.data)
    },
    createBranch(businessId: string, dto: CreateBranchDto): Promise<{ id: string; name: string }> {
      return api.post(`/${segment}/${businessId}/branches`, dto).then((r) => r.data)
    },
    updateBranch(businessId: string, id: string, dto: Partial<CreateBranchDto>): Promise<{ id: string; name: string }> {
      return api.put(`/${segment}/${businessId}/branches/${id}`, dto).then((r) => r.data)
    },
    deleteBranch(businessId: string, id: string): Promise<void> {
      return api.delete(`/${segment}/${businessId}/branches/${id}`)
    },
  }
}
