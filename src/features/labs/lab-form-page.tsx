import { BusinessFormPage } from '@/features/businesses/business-form-page'
import { labHooks } from './index'

export function LabFormPage() {
  return (
    <BusinessFormPage
      useDetails={(id) => labHooks.useDetails(id)}
      useCreate={() => labHooks.useCreate()}
      useUpdate={() => labHooks.useUpdate()}
      singularLabel="مختبر"
      backRoute="/labs"
      segment="labs"
    />
  )
}
