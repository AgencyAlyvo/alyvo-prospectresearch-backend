import type { LocalBusinessStatus } from '#enums/local_business_status'
import type { ProspectActionResponse } from '#types/response/actions/prospect_action_response'

/**
 * Forme compacte d'un prospect business local, retournee dans les listings.
 */
export type LocalBusinessProspectSummaryResponse = {
  id: number
  name: string
  category: string | null
  subcategory: string | null
  osmType: string | null
  osmId: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  region: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  emailSource: string | null
  website: string | null
  pagesJaunesUrl: string | null
  hasWebsite: boolean
  seoScore: number | null
  performanceScore: number | null
  accessibilityScore: number | null
  bestPracticesScore: number | null
  lighthouseFetchedAt: string | null
  enrichedAt: string | null
  status: LocalBusinessStatus
  isFavorite: boolean
  contactChannel: string | null
  nextAction: string | null
  nextActionAt: string | null
  firstContactAt: string | null
  relancesCount: number
  repliedAt: string | null
  positiveReply: boolean
  discoveryCallAt: string | null
  salesCallAt: string | null
  proposalAmount: number | null
  signedAmount: number | null
  addedAtWeek: string | null
  createdAt: string
}

/**
 * Forme complete (toObject + champs avances + timeline).
 */
export type LocalBusinessProspectFullResponse = LocalBusinessProspectSummaryResponse & {
  openingHours: string | null
  notes: string | null
  identifiedNeed: string | null
  relance1At: string | null
  relance2At: string | null
  relance3At: string | null
  discoveryCallDone: boolean
  salesCallDone: boolean
  proposalSentAt: string | null
  dealWon: boolean
  signedAt: string | null
  lossReason: string | null
  updatedAt: string | null
  actions: ProspectActionResponse[]
}
