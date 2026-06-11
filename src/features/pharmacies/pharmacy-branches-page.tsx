import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { BranchesPage } from '@/features/businesses/branches-page'
import { pharmacyHooks } from './index'

const branchApi = createBranchApi('pharmacies')
const branchHooks = createBranchHooks('pharmacy-branches', branchApi)

export function PharmacyBranchesPage() {
  return (
    <BranchesPage
      singularLabel="صيدلية"
      backRoute="/pharmacies"
      branchHooks={branchHooks}
      branchApi={branchApi}
      useDetails={(id) => pharmacyHooks.useDetails(id)}
    />
  )
}
