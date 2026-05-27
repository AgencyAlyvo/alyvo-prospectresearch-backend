import type { CreateLocalBusinessProspectPayload } from '#types/payload/local_business/create_local_business_prospect_payload'
import type { LocalBusinessStatus } from '#enums/local_business_status'

/**
 * Payload valide pour mettre a jour un prospect business local.
 */
export type UpdateLocalBusinessProspectPayload = Partial<CreateLocalBusinessProspectPayload> & {
  status?: LocalBusinessStatus
  nextAction?: string | null
  nextActionAt?: string | null
  identifiedNeed?: string | null
  discoveryCallAt?: string | null
  salesCallAt?: string | null
  proposalSentAt?: string | null
  signedAt?: string | null
  proposalAmount?: number | null
  signedAmount?: number | null
  lossReason?: string | null
  // Scores Lighthouse mis a jour par le webhook d'enrichissement.
  seoScore?: number | null
  performanceScore?: number | null
  accessibilityScore?: number | null
  bestPracticesScore?: number | null
  isFavorite?: boolean
}
