import { BusinessFormPage } from '@/features/businesses/business-form-page'
import { pharmacyHooks } from './index'

export function PharmacyFormPage() {
  return (
    <BusinessFormPage
      useDetails={(id) => pharmacyHooks.useDetails(id)}
      useCreate={() => pharmacyHooks.useCreate()}
      useUpdate={() => pharmacyHooks.useUpdate()}
      singularLabel="صيدلية"
      backRoute="/pharmacies"
      segment="pharmacies"
    />
  )
}
