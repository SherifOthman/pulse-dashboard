export type PaginatedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

export const BusinessType = {
  Doctor: 1,
  Pharmacy: 2,
  Laboratory: 3,
  Radiology: 4,
} as const
