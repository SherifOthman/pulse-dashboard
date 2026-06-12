import { BranchFormPage } from '@/features/businesses/branch-form-page'
import { getBranchDetails, createBranch, updateBranch } from './branches-api'
import { useCreateBranch, useUpdateBranch } from './use-branches'
import { useDoctorDetails } from './use-doctors'

const branchApi = { getBranchDetails, createBranch, updateBranch }
const branchHooks = { useCreateBranch, useUpdateBranch }

export function DoctorBranchFormPage() {
  return (
    <BranchFormPage
      singularLabel="طبيب"
      backRoute="/doctors"
      showVisitPrice
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => useDoctorDetails(id)}
    />
  )
}
