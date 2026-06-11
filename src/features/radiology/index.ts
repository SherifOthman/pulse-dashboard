import { createBusinessApi } from '@/features/businesses/business-api'
import { createBusinessHooks } from '@/features/businesses/use-business'

export const radiologyApi   = createBusinessApi('radiology')
export const radiologyHooks = createBusinessHooks('radiology', radiologyApi)
