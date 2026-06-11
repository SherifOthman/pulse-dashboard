import { FlaskConical } from 'lucide-react'
import { BusinessDetailsPage } from '@/features/businesses/business-details-page'
import { labHooks } from './index'

export function LabDetailsPage() {
  return (
    <BusinessDetailsPage
      useDetails={(id) => labHooks.useDetails(id)}
      useDelete={() => labHooks.useDelete()}
      singularLabel="مختبر"
      backRoute="/labs"
      segment="labs"
      coverIcon={<FlaskConical className="h-16 w-16 text-muted/20" />}
    />
  )
}
