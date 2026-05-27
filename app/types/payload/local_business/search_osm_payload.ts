/**
 * Payload pour rechercher des business OSM par ville sans les persister.
 * Utilise pour la page "Import depuis OSM" (preview avant ajout).
 */
export type SearchOsmPayload = {
  city: string
  category?: string
  /** Plafond optionnel ; omis = tous les POI correspondants dans le .pbf */
  limit?: number
}

/**
 * Resultat brut d'une recherche OSM (avant import).
 */
export type OsmSearchResult = {
  osmType: string
  osmId: string
  name: string
  category: string | null
  subcategory: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  facebookUrl: string | null
  openingHours: string | null
}
