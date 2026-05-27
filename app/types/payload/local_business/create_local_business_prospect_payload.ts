import type { LocalBusinessStatus } from '#enums/local_business_status'
import type { LocalBusinessContactChannel } from '#enums/local_business_contact_channel'
import type { LocalBusinessEmailSource } from '#enums/local_business_email_source'

/**
 * Payload valide pour creer un prospect "business local" manuellement.
 * Aussi utilise lors d'un import en masse depuis OpenStreetMap.
 */
export type CreateLocalBusinessProspectPayload = {
  name: string
  category?: string | null
  subcategory?: string | null
  osmType?: string | null
  osmId?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  region?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  phone?: string | null
  email?: string | null
  emailSource?: LocalBusinessEmailSource | null
  website?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  openingHours?: string | null
  contactChannel?: LocalBusinessContactChannel | null
  notes?: string | null
  status?: LocalBusinessStatus
}
