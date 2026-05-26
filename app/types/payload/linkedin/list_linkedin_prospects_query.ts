import type { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'

/**
 * Champs autorises pour le tri de la liste des prospects LinkedIn.
 */
export type LinkedinProspectsSortField = 'createdAt' | 'nextActionAt' | 'invitationSentAt' | 'lastName'

/**
 * Query string validee pour lister les prospects LinkedIn (paragraphes 5.2 section 4 et 6.4).
 */
export type ListLinkedinProspectsQuery = {
  page?: number
  perPage?: number
  search?: string
  status?: LinkedinProspectStatus[]
  industry?: string
  city?: string
  region?: string
  position?: string
  company?: string
  invitationSent?: boolean
  invitationAccepted?: boolean
  replied?: boolean
  hasEmail?: boolean
  week?: string
  sortBy?: LinkedinProspectsSortField
  sortDir?: 'asc' | 'desc'
}
