import type { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'
import type { ProspectActionResponse } from '#types/response/actions/prospect_action_response'

/**
 * Forme compacte d'un prospect LinkedIn, retournee dans les listings.
 */
export type LinkedinProspectSummaryResponse = {
  id: number
  firstName: string
  lastName: string
  position: string | null
  company: string | null
  industry: string | null
  city: string | null
  region: string | null
  linkedinUrl: string | null
  companyLinkedinUrl: string | null
  websiteUrl: string | null
  email: string | null
  phone: string | null
  status: LinkedinProspectStatus
  invitationSentAt: string | null
  invitationAcceptedAt: string | null
  message1SentAt: string | null
  repliedAt: string | null
  positiveReply: boolean
  relancesCount: number
  nextAction: string | null
  nextActionAt: string | null
  discoveryCallAt: string | null
  salesCallAt: string | null
  proposalAmount: number | null
  signedAmount: number | null
  addedAtWeek: string | null
  createdAt: string
}

/**
 * Forme complete d'un prospect LinkedIn, retournee sur la fiche detaillee.
 * Inclut la timeline ordonnee chronologiquement (plus recente en premier).
 */
export type LinkedinProspectFullResponse = LinkedinProspectSummaryResponse & {
  country: string | null
  profileHeadline: string | null
  openToWork: boolean | null
  hiring: boolean | null
  connectionsCount: number | null
  followerCount: number | null
  companyEmployeeCountRange: string | null
  companyType: string | null
  companyTagline: string | null
  companyDescription: string | null
  relance1At: string | null
  relance2At: string | null
  relance3At: string | null
  identifiedNeed: string | null
  discoveryCallDone: boolean
  salesCallDone: boolean
  proposalSentAt: string | null
  dealWon: boolean
  signedAt: string | null
  lossReason: string | null
  updatedAt: string | null
  actions: ProspectActionResponse[]
}
