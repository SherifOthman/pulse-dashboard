import { BranchDetailPage } from '@/features/businesses/branch-detail-page'
import { getBranchDetails, deleteBranch } from './branches-api'
import { useDeleteBranch } from './use-branches'
import { useDoctorDetails } from './use-doctors'

const branchApi = { getBranchDetails, deleteBranch }
const branchHooks = { useDeleteBranch }

export function DoctorBranchDetailPage() {
  return (
    <BranchDetailPage
      singularLabel="طبيب"
      backRoute="/doctors"
      showVisitPrice
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => useDoctorDetails(id)}
    />
  )
}
