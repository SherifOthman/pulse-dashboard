import { BranchDetailPage } from '@/features/businesses/branch-detail-page'
import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { labHooks } from './index'

const branchApi = createBranchApi('labs')
const branchHooks = createBranchHooks('lab-branches', branchApi)

export function LabBranchDetailPage() {
  return (
    <BranchDetailPage
      singularLabel="مختبر"
      backRoute="/labs"
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => labHooks.useDetails(id)}
    />
  )
}
