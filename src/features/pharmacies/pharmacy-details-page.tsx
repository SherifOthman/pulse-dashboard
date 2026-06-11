import { Pill } from 'lucide-react'
import { BusinessDetailsPage } from '@/features/businesses/business-details-page'
import { pharmacyHooks } from './index'

export function PharmacyDetailsPage() {
  return (
    <BusinessDetailsPage
      useDetails={(id) => pharmacyHooks.useDetails(id)}
      useDelete={() => pharmacyHooks.useDelete()}
      singularLabel="صيدلية"
      backRoute="/pharmacies"
      segment="pharmacies"
      coverIcon={<Pill className="h-16 w-16 text-muted/20" />}
    />
  )
}
