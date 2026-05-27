import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import OsmImportException from '#exceptions/osm_import_exception'
import type { ModelAttributes } from '@adonisjs/lucid/types/model'
import LocalBusinessProspect from '#models/local_business_prospect'
import type User from '#models/user'
import type { OsmSearchResult } from '#types/payload/local_business/search_osm_payload'
import { normalizeExternalUrl, normalizeImportEmail } from '#utils/external_url'
import { resolveRegionFromOsmTags } from '#utils/french_address'

const nodeRequire: ReturnType<typeof createRequire> = createRequire(import.meta.url)

/**
 * Categories OSM considerees comme des "business locaux" prospectables.
 * Cle = tag OSM principal ; valeur = liste de valeurs autorisees (ou * pour tout).
 */
const BUSINESS_TAG_FILTERS: Record<string, string[] | '*'> = {
  amenity: [
    'restaurant',
    'cafe',
    'bar',
    'pub',
    'fast_food',
    'bank',
    'pharmacy',
    'dentist',
    'doctors',
    'clinic',
    'veterinary',
    'driving_school',
    'car_wash',
    'car_rental',
    'fuel',
    'bicycle_rental',
    'marketplace',
  ],
  shop: '*',
  craft: '*',
  office: '*',
  healthcare: '*',
  tourism: ['hotel', 'guest_house', 'motel', 'hostel', 'camp_site', 'museum', 'attraction'],
  leisure: ['fitness_centre', 'sports_centre', 'golf_course', 'spa'],
}

/**
 * Element OSM brut tel que produit par osm-pbf-parser.
 */
type OsmItem = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  tags?: Record<string, string>
}

/**
 * Service d'import OpenStreetMap : recherche par ville et bulk import.
 *
 * Le pbf doit avoir ete pre-filtre avec osmium-tool pour ne contenir
 * que les business pertinents (cf. README backend ou la doc du plan).
 */
export default class LocalBusinessImportService {
  /**
   * Recherche des business OSM dans le pbf local, filtres par ville.
   * Parcourt tout le fichier .pbf sauf si `limit` est fourni (plafond optionnel).
   * @param {string} city - Nom de la ville recherchee (tag addr:city, contient le texte).
   * @param {object} options - Options de filtrage.
   * @param {string} [options.category] - Categorie OSM principale (amenity, shop, ...).
   * @param {number} [options.limit] - Plafond optionnel de resultats (sinon tous les POI correspondants).
   * @param {string} [options.pbfPath] - Chemin du pbf (default: env OSM_PBF_FILE_PATH).
   * @returns {Promise<OsmSearchResult[]>} Resultats normalises.
   */
  public static async searchByCity(
    city: string,
    options: { category?: string; limit?: number; pbfPath?: string } = {},
  ): Promise<OsmSearchResult[]> {
    const pbfPath: string = options.pbfPath ?? process.env.OSM_PBF_FILE_PATH ?? ''
    if (!pbfPath) {
      throw new OsmImportException(
        'Chemin du fichier OSM .pbf non configure (env OSM_PBF_FILE_PATH ou option --file)',
        503,
      )
    }
    if (!fs.existsSync(pbfPath)) {
      throw new OsmImportException(`Fichier OSM introuvable : ${pbfPath}`, 404)
    }

    const limit: number | undefined = options.limit !== undefined && options.limit > 0 ? options.limit : undefined
    const cityLower: string = city.trim().toLowerCase()
    const results: OsmSearchResult[] = []

    const parserFactory: () => NodeJS.ReadWriteStream = nodeRequire('osm-pbf-parser') as () => NodeJS.ReadWriteStream
    const parser: NodeJS.ReadWriteStream = parserFactory()
    const stream: fs.ReadStream = fs.createReadStream(pbfPath)

    await new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void) => {
      let stopped: boolean = false

      stream.on('error', (err: Error) => reject(err))
      parser.on('error', (err: Error) => reject(err))

      parser.on('data', (items: OsmItem[]) => {
        if (stopped) return
        for (const item of items) {
          if (!item.tags) continue
          if (!LocalBusinessImportService.matchesBusiness(item.tags, options.category)) continue
          if (!LocalBusinessImportService.resolveOsmDisplayName(item.tags)) continue
          const itemCity: string = (item.tags['addr:city'] ?? '').toLowerCase()
          if (!itemCity.includes(cityLower)) continue

          const normalized: OsmSearchResult | null = LocalBusinessImportService.normalizeOsmItem(item)
          if (normalized) {
            results.push(normalized)
            if (limit !== undefined && results.length >= limit) {
              stopped = true
              stream.destroy()
              parser.end()
              resolve()
              return
            }
          }
        }
      })

      parser.on('end', () => resolve())
      stream.pipe(parser as unknown as NodeJS.WritableStream)
    })

    return results
  }

  /**
   * Bulk import : parse le pbf entier et upsert chaque business en base.
   * Utilise par la commande Adonis import:osm-businesses.
   * @param {string} pbfPath - Chemin du pbf pre-filtre.
   * @param {User} user - Utilisateur destinataire des imports.
   * @param {(progress: { read: number; inserted: number; skipped: number }) => void} [onProgress] - Callback de progression.
   * @returns {Promise<{ inserted: number; skipped: number; read: number }>} Statistiques.
   */
  public static async importPbfToDatabase(
    pbfPath: string,
    user: User,
    onProgress?: (progress: { read: number; inserted: number; skipped: number }) => void,
  ): Promise<{ inserted: number; skipped: number; read: number }> {
    if (!fs.existsSync(pbfPath)) {
      throw new OsmImportException(`Fichier OSM introuvable : ${pbfPath}`, 404)
    }

    let read: number = 0
    let inserted: number = 0
    let skipped: number = 0
    const batch: OsmSearchResult[] = []
    const BATCH_SIZE: number = 500

    const parserFactory: () => NodeJS.ReadWriteStream = nodeRequire('osm-pbf-parser') as () => NodeJS.ReadWriteStream
    const parser: NodeJS.ReadWriteStream = parserFactory()
    const stream: fs.ReadStream = fs.createReadStream(pbfPath)

    /**
     * Insere le lot courant en base.
     * @returns {Promise<void>} Promesse resolue apres insertion.
     */
    const flushBatch: () => Promise<void> = async (): Promise<void> => {
      if (batch.length === 0) return
      const items: OsmSearchResult[] = batch.splice(0, batch.length)
      const rows: Partial<ModelAttributes<LocalBusinessProspect>>[] = items.map(
        (item: OsmSearchResult): Partial<ModelAttributes<LocalBusinessProspect>> => ({
          userId: user.id,
          osmType: item.osmType,
          osmId: item.osmId,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          address: item.address,
          city: item.city,
          postalCode: item.postalCode,
          region: item.region,
          country: 'France',
          latitude: item.latitude !== null ? String(item.latitude) : null,
          longitude: item.longitude !== null ? String(item.longitude) : null,
          phone: item.phone,
          email: item.email,
          emailSource: item.email ? 'osm' : null,
          website: item.website,
          facebookUrl: item.facebookUrl,
          openingHours: item.openingHours,
          hasWebsite: Boolean(item.website && item.website.trim().length > 0),
          status: 'a_contacter',
          relancesCount: 0,
          positiveReply: false,
          discoveryCallDone: false,
          salesCallDone: false,
          dealWon: false,
        }),
      )
      try {
        const created: LocalBusinessProspect[] = await LocalBusinessProspect.createMany(rows)
        inserted += created.length
      } catch {
        skipped += rows.length
      }
    }

    await new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void) => {
      stream.on('error', (err: Error) => reject(err))
      parser.on('error', (err: Error) => reject(err))

      let processing: Promise<void> = Promise.resolve()

      parser.on('data', (items: OsmItem[]) => {
        processing = processing.then(async (): Promise<void> => {
          for (const item of items) {
            read += 1
            if (!item.tags || !LocalBusinessImportService.resolveOsmDisplayName(item.tags)) {
              continue
            }
            if (!LocalBusinessImportService.matchesBusiness(item.tags)) {
              continue
            }
            const normalized: OsmSearchResult | null = LocalBusinessImportService.normalizeOsmItem(item)
            if (!normalized) {
              continue
            }
            batch.push(normalized)
            if (batch.length >= BATCH_SIZE) {
              await flushBatch()
            }
            if (read % 10000 === 0 && onProgress) {
              onProgress({ read, inserted, skipped })
            }
          }
        })
      })

      parser.on('end', () => {
        processing
          .then(async (): Promise<void> => {
            await flushBatch()
          })
          .then((): void => resolve())
          .catch((err: unknown): void => reject(err))
      })

      stream.pipe(parser as unknown as NodeJS.WritableStream)
    })

    return { read, inserted, skipped }
  }

  /**
   * Indique si un POI OSM correspond a un "business local" prospectable.
   * @param {Record<string, string>} tags - Tags OSM.
   * @param {string} [requiredCategory] - Categorie principale eventuelle.
   * @returns {boolean} True si match.
   */
  private static matchesBusiness(tags: Record<string, string>, requiredOsmType?: string): boolean {
    for (const [tag, allowedValues] of Object.entries(BUSINESS_TAG_FILTERS)) {
      const value: string | undefined = tags[tag]
      if (!value) continue
      if (allowedValues === '*' || allowedValues.includes(value)) {
        if (!requiredOsmType || value === requiredOsmType) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Normalise un item OSM brut en payload OsmSearchResult.
   * @param {OsmItem} item - Element OSM.
   * @returns {OsmSearchResult | null} Resultat ou null si donnees manquantes.
   */
  private static normalizeOsmItem(item: OsmItem): OsmSearchResult | null {
    const tags: Record<string, string> = item.tags ?? {}
    const name: string | undefined = LocalBusinessImportService.resolveOsmDisplayName(tags)
    if (!name) return null

    const street: string | undefined = tags['addr:street']
    const housenumber: string | undefined = tags['addr:housenumber']
    const address: string | null = street ? `${housenumber ? `${housenumber} ` : ''}${street}` : null

    const category: string | null = LocalBusinessImportService.detectCategory(tags)
    const subcategory: string | null = category ? (tags[category] ?? null) : null
    const postalCode: string | null = tags['addr:postcode'] ?? null

    return {
      osmType: item.type,
      osmId: String(item.id),
      name,
      category,
      subcategory,
      address,
      city: tags['addr:city'] ?? null,
      postalCode,
      region: resolveRegionFromOsmTags(tags, postalCode),
      latitude: typeof item.lat === 'number' ? item.lat : null,
      longitude: typeof item.lon === 'number' ? item.lon : null,
      phone: tags.phone || tags['contact:phone'] || null,
      email: normalizeImportEmail(tags.email || tags['contact:email'] || null),
      website: normalizeExternalUrl(tags.website || tags['contact:website'] || tags['contact:url'] || null),
      facebookUrl: normalizeExternalUrl(tags['contact:facebook'] ?? null),
      openingHours: tags.opening_hours || null,
    }
  }

  /**
   * Choisit le nom affichable le plus complet parmi les tags OSM usuels.
   * @param {Record<string, string>} tags - Tags OSM.
   * @returns {string | undefined} Nom retenu ou undefined.
   */
  private static resolveOsmDisplayName(tags: Record<string, string>): string | undefined {
    const candidates: string[] = [tags['name:fr'], tags.name, tags.brand, tags.operator].filter(
      (value: string | undefined): value is string => typeof value === 'string' && value.trim().length > 0,
    )
    if (candidates.length === 0) {
      return undefined
    }
    return candidates.reduce((best: string, current: string): string =>
      current.trim().length > best.trim().length ? current : best,
    )
  }

  /**
   * Detecte la categorie OSM principale d'un POI selon la priorite metier.
   * @param {Record<string, string>} tags - Tags OSM.
   * @returns {string | null} Cle de la categorie principale ou null.
   */
  private static detectCategory(tags: Record<string, string>): string | null {
    const priority: string[] = ['amenity', 'shop', 'craft', 'office', 'healthcare', 'tourism', 'leisure']
    for (const tag of priority) {
      if (tags[tag]) return tag
    }
    return null
  }

  /**
   * Resout un chemin .pbf relatif a la racine du backend en chemin absolu.
   * @param {string} filePath - Chemin (absolu ou relatif).
   * @returns {string} Chemin absolu.
   */
  public static resolvePbfPath(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath
    return path.resolve(process.cwd(), filePath)
  }
}
