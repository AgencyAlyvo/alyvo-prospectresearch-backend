import type { OsmSearchResult } from '#types/payload/local_business/search_osm_payload'

/**
 * Payload d'import en masse depuis OSM (apres preview).
 */
export type BulkImportFromOsmPayload = {
  items: OsmSearchResult[]
}
