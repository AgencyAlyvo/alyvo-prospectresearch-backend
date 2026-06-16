import type { LinkedinProspectSummaryResponse } from '#types/response/linkedin/linkedin_prospect_response'

/**
 * Relance LinkedIn due pour un prospect.
 */
export type DueRelanceResponse = {
  prospect: LinkedinProspectSummaryResponse
  relanceNumber: 1 | 2 | 3
  dueAt: string
  message1SentAt: string
  isDue: boolean
  daysOverdue: number
}
