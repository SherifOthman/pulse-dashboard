import { createBusinessApi } from '@/features/businesses/business-api'
import { createBusinessHooks } from '@/features/businesses/use-business'

export const pharmacyApi   = createBusinessApi('pharmacies')
export const pharmacyHooks = createBusinessHooks('pharmacies', pharmacyApi)
