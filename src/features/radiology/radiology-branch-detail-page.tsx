import { BranchDetailPage } from '@/features/businesses/branch-detail-page'
import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { radiologyHooks } from './index'

const branchApi = createBranchApi('radiology')
const branchHooks = createBranchHooks('radiology-branches', branchApi)

export function RadiologyBranchDetailPage() {
  return (
    <BranchDetailPage
      singularLabel="مركز أشعة"
      backRoute="/radiology"
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => radiologyHooks.useDetails(id)}
    />
  )
}
