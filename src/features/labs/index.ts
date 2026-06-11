import { createBusinessApi } from '@/features/businesses/business-api'
import { createBusinessHooks } from '@/features/businesses/use-business'

export const labApi   = createBusinessApi('labs')
export const labHooks = createBusinessHooks('labs', labApi)
