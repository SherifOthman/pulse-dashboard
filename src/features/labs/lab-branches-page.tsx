import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { BranchesPage } from '@/features/businesses/branches-page'
import { labHooks } from './index'

const branchApi = createBranchApi('labs')
const branchHooks = createBranchHooks('lab-branches', branchApi)

export function LabBranchesPage() {
  return (
    <BranchesPage
      singularLabel="مختبر"
      backRoute="/labs"
      branchHooks={branchHooks}
      branchApi={branchApi}
      useDetails={(id) => labHooks.useDetails(id)}
    />
  )
}
