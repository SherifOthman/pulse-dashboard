import { BusinessFormPage } from '@/features/businesses/business-form-page'
import { radiologyHooks } from './index'

export function RadiologyFormPage() {
  return (
    <BusinessFormPage
      useDetails={(id) => radiologyHooks.useDetails(id)}
      useCreate={() => radiologyHooks.useCreate()}
      useUpdate={() => radiologyHooks.useUpdate()}
      singularLabel="مركز أشعة"
      backRoute="/radiology"
      segment="radiology"
    />
  )
}
