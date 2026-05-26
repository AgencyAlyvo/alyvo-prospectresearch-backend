import type { CreateLinkedinProspectPayload } from '#types/payload/linkedin/create_linkedin_prospect_payload'
import type { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'

/**
 * Payload valide pour mettre a jour un prospect LinkedIn.
 * Tous les champs sont optionnels - on n'ecrit que ce qui est explicitement fourni.
 */
export type UpdateLinkedinProspectPayload = Partial<CreateLinkedinProspectPayload> & {
  status?: LinkedinProspectStatus
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
}
