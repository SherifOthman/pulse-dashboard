import { BranchFormPage } from '@/features/businesses/branch-form-page'
import { createBranchApi } from '@/features/businesses/branches-api'
import { createBranchHooks } from '@/features/businesses/use-branches'
import { labHooks } from './index'

const branchApi = createBranchApi('labs')
const branchHooks = createBranchHooks('lab-branches', branchApi)

export function LabBranchFormPage() {
  return (
    <BranchFormPage
      singularLabel="مختبر"
      backRoute="/labs"
      branchApi={branchApi}
      branchHooks={branchHooks}
      useParentDetails={(id) => labHooks.useDetails(id)}
    />
  )
}
