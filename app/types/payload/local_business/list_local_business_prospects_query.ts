import type { LocalBusinessStatus } from '#enums/local_business_status'

/**
 * Champs autorises pour le tri du listing des business locaux.
 */
export type LocalBusinessSortField = 'createdAt' | 'nextActionAt' | 'name' | 'seoScore' | 'performanceScore'

/**
 * Query string validee pour lister les business locaux.
 */
export type ListLocalBusinessProspectsQuery = {
  page?: number
  perPage?: number
  search?: string
  status?: LocalBusinessStatus[]
  category?: string
  city?: string
  region?: string
  postalCode?: string
  hasWebsite?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
  seoScoreMax?: number
  isFavorite?: boolean
  week?: string
  sortBy?: LocalBusinessSortField
  sortDir?: 'asc' | 'desc'
}
