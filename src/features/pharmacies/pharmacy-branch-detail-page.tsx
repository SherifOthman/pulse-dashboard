import { BranchDetailPage } from '@/features/businesses/branch-detail-page'
import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { pharmacyHooks } from './index'

const branchApi = createBranchApi('pharmacies')
const branchHooks = createBranchHooks('pharmacy-branches', branchApi)

export function PharmacyBranchDetailPage() {
  return (
    <BranchDetailPage
      singularLabel="صيدلية"
      backRoute="/pharmacies"
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => pharmacyHooks.useDetails(id)}
    />
  )
}
