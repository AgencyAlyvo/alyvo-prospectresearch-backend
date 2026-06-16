import type { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'

/**
 * Payload valide pour creer un prospect LinkedIn manuellement.
 * Voir cahier des charges, paragraphes 6.2 et 17.1 (deduplication).
 */
export type CreateLinkedinProspectPayload = {
  firstName: string
  lastName: string
  position?: string | null
  company?: string | null
  industry?: string | null
  city?: string | null
  region?: string | null
  country?: string | null
  profileHeadline?: string | null
  openToWork?: boolean | null
  hiring?: boolean | null
  connectionsCount?: number | null
  followerCount?: number | null
  linkedinUrl?: string | null
  companyLinkedinUrl?: string | null
  websiteUrl?: string | null
  email?: string | null
  phone?: string | null
  companyEmployeeCountRange?: string | null
  companyType?: string | null
  companyTagline?: string | null
  companyDescription?: string | null
  status?: LinkedinProspectStatus
}
