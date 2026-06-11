import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { BranchesPage } from '@/features/businesses/branches-page'
import { radiologyHooks } from './index'

const branchApi = createBranchApi('radiology')
const branchHooks = createBranchHooks('radiology-branches', branchApi)

export function RadiologyBranchesPage() {
  return (
    <BranchesPage
      singularLabel="مركز أشعة"
      backRoute="/radiology"
      branchHooks={branchHooks}
      branchApi={branchApi}
      useDetails={(id) => radiologyHooks.useDetails(id)}
    />
  )
}
