import { BranchFormPage } from '@/features/businesses/branch-form-page'
import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { pharmacyHooks } from './index'

const branchApi = createBranchApi('pharmacies')
const branchHooks = createBranchHooks('pharmacy-branches', branchApi)

export function PharmacyBranchFormPage() {
  return (
    <BranchFormPage
      singularLabel="صيدلية"
      backRoute="/pharmacies"
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => pharmacyHooks.useDetails(id)}
    />
  )
}
