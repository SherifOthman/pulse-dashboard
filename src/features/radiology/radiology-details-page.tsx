import { Scan } from 'lucide-react'
import { BusinessDetailsPage } from '@/features/businesses/business-details-page'
import { radiologyHooks } from './index'

export function RadiologyDetailsPage() {
  return (
    <BusinessDetailsPage
      useDetails={(id) => radiologyHooks.useDetails(id)}
      useDelete={() => radiologyHooks.useDelete()}
      singularLabel="مركز أشعة"
      backRoute="/radiology"
      coverIcon={<Scan className="h-16 w-16 text-muted/20" />}
      segment="radiology"
    />
  )
}
