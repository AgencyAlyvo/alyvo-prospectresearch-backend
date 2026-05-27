import env from '#start/env'
import { LocalBusinessEmailSource } from '#enums/local_business_email_source'
import type { CreateLocalBusinessProspectPayload } from '#types/payload/local_business/create_local_business_prospect_payload'

/**
 * Resultat enrichi pour un item d'import OSM, retourne par le workflow n8n.
 * Tous les champs sont nullables : seuls ceux non-null ecrasent la donnee OSM.
 */
export type LocalBusinessImportEnrichmentResult = {
  osmType: string | null
  osmId: string | null
  website: string | null
  websiteAlive: boolean | null
  email: string | null
  emailSource: LocalBusinessEmailSource.WEBSITE_SCRAPE | LocalBusinessEmailSource.PAGES_JAUNES | null
  phone: string | null
  pagesJaunesUrl: string | null
}

/**
 * Objet JSON generique renvoye par n8n.
 */
type N8nPayload = Record<string, unknown>

/**
 * Timeout du webhook n8n d'enrichissement a l'import (ms).
 * Le workflow enchaîne HTTP check + crawl + Pages Jaunes + recrawl,
 * on prend de la marge pour gros lots.
 */
const N8N_IMPORT_ENRICHMENT_TIMEOUT_MS: number = 240_000

/**
 * Service d'enrichissement des business locaux au moment de l'import OSM.
 *
 * Le workflow n8n est cense :
 *   1. Verifier en HTTP 200 le site web fourni par OSM (souvent obsolete)
 *   2. Si vivant : crawler le site pour extraire email + telephone
 *   3. Interroger Pages Jaunes pour recuperer site web / email / telephone manquants
 *   4. Si Pages Jaunes fournit un site, le verifier en HTTP 200 et le crawler aussi
 *   5. Renvoyer un tableau de resultats indexes sur le couple osmType + osmId
 *
 * Le service est tolerant aux pannes : en cas d'erreur reseau, HTTP non-2xx,
 * JSON invalide ou URL non configuree, il renvoie un tableau vide ; l'import
 * continue alors avec les donnees OSM brutes (cf. bulkCreateFromOsm).
 */
export default class LocalBusinessImportEnrichmentService {
  /**
   * Appelle n8n pour enrichir un lot d'items OSM avant insertion en base.
   * @param {CreateLocalBusinessProspectPayload[]} items - Items dedupliques, prets a etre inseres.
   * @returns {Promise<LocalBusinessImportEnrichmentResult[]>} Resultats enrichis (peut etre vide).
   */
  public static async enrichBatch(
    items: CreateLocalBusinessProspectPayload[],
  ): Promise<LocalBusinessImportEnrichmentResult[]> {
    if (items.length === 0) {
      console.log('[n8n import] items vide, skip')
      return []
    }

    const webhookUrl: string | undefined = env.get('N8N_LOCAL_BUSINESS_IMPORT_ENRICHMENT_WEBHOOK_URL')
    console.log('[n8n import] items.length =', items.length, '| webhookUrl =', webhookUrl)
    if (!webhookUrl) {
      console.log('[n8n import] URL non definie, fallback OSM')
      return []
    }

    const body: N8nPayload = {
      items: items.map(
        (item: CreateLocalBusinessProspectPayload): N8nPayload => ({
          osmType: item.osmType ?? null,
          osmId: item.osmId ?? null,
          name: item.name,
          city: item.city ?? null,
          postalCode: item.postalCode ?? null,
          address: item.address ?? null,
          website: item.website ?? null,
          phone: item.phone ?? null,
          email: item.email ?? null,
        }),
      ),
    }

    const controller: AbortController = new AbortController()
    const timeout: NodeJS.Timeout = setTimeout((): void => controller.abort(), N8N_IMPORT_ENRICHMENT_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: LocalBusinessImportEnrichmentService.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (err) {
      console.log('[n8n import] fetch failed:', err instanceof Error ? err.message : err)
      clearTimeout(timeout)
      return []
    }
    clearTimeout(timeout)

    console.log('[n8n import] response.status =', response.status)

    if (!response.ok) {
      const errorBody: string = await response.text().catch((): string => '')
      console.log('[n8n import] response NOT OK, body =', errorBody.slice(0, 500))
      return []
    }

    let json: unknown
    try {
      json = await response.json()
    } catch (err) {
      console.log('[n8n import] JSON parse failed:', err instanceof Error ? err.message : err)
      return []
    }

    const bodyPreview: string = JSON.stringify(json).slice(0, 800)
    console.log('[n8n import] response body preview =', bodyPreview)

    const normalized: LocalBusinessImportEnrichmentResult[] =
      LocalBusinessImportEnrichmentService.normalizeResponse(json)
    console.log('[n8n import] normalized count =', normalized.length)
    return normalized
  }

  /**
   * Prepare les headers envoyes au webhook.
   * @returns {Record<string, string>} Headers HTTP.
   */
  private static buildHeaders(): Record<string, string> {
    const secret: string | undefined = env.get('N8N_LOCAL_BUSINESS_IMPORT_ENRICHMENT_WEBHOOK_HEADER_SECRET')
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Alyvo-Webhook-Secret': secret } : {}),
    }
  }

  /**
   * Normalise la reponse n8n en extrayant le tableau d'items quel que soit son emplacement.
   * Supporte les formes : array racine, { items: [...] }, { data: [...] }, { results: [...] },
   * ou un objet unique qu'on emballe en tableau.
   * @param {unknown} body - Corps brut JSON renvoye par n8n.
   * @returns {LocalBusinessImportEnrichmentResult[]} Resultats normalises.
   */
  private static normalizeResponse(body: unknown): LocalBusinessImportEnrichmentResult[] {
    const rawItems: unknown[] = LocalBusinessImportEnrichmentService.extractItems(body)
    return rawItems
      .map((raw: unknown): LocalBusinessImportEnrichmentResult | null =>
        LocalBusinessImportEnrichmentService.normalizeItem(raw),
      )
      .filter((item: LocalBusinessImportEnrichmentResult | null): item is LocalBusinessImportEnrichmentResult =>
        Boolean(item && (item.osmType || item.osmId)),
      )
  }

  /**
   * Extrait un tableau d'items depuis une reponse n8n potentiellement nestee.
   * @param {unknown} body - Corps brut.
   * @returns {unknown[]} Liste d'items bruts.
   */
  private static extractItems(body: unknown): unknown[] {
    if (Array.isArray(body)) {
      return body
    }
    if (LocalBusinessImportEnrichmentService.isPayload(body)) {
      const candidate: unknown = body.items ?? body.data ?? body.results ?? body.json
      if (Array.isArray(candidate)) {
        return candidate
      }
      if (LocalBusinessImportEnrichmentService.isPayload(candidate)) {
        return [candidate]
      }
      return [body]
    }
    return []
  }

  /**
   * Normalise un item enrichi unique. Renvoie null si la cle OSM est introuvable.
   * @param {unknown} raw - Item brut.
   * @returns {LocalBusinessImportEnrichmentResult | null} Item normalise ou null.
   */
  private static normalizeItem(raw: unknown): LocalBusinessImportEnrichmentResult | null {
    if (!LocalBusinessImportEnrichmentService.isPayload(raw)) {
      return null
    }
    return {
      osmType: LocalBusinessImportEnrichmentService.readString(raw, ['osmType', 'osm_type']),
      osmId: LocalBusinessImportEnrichmentService.readString(raw, ['osmId', 'osm_id']),
      website: LocalBusinessImportEnrichmentService.readString(raw, ['website', 'websiteUrl', 'website_url']),
      websiteAlive: LocalBusinessImportEnrichmentService.readBoolean(raw, [
        'websiteAlive',
        'website_alive',
        'isWebsiteAlive',
      ]),
      email: LocalBusinessImportEnrichmentService.readString(raw, ['email', 'emailAddress', 'email_address']),
      emailSource: LocalBusinessImportEnrichmentService.readEmailSource(raw),
      phone: LocalBusinessImportEnrichmentService.readString(raw, ['phone', 'telephone', 'phone_number']),
      pagesJaunesUrl: LocalBusinessImportEnrichmentService.readString(raw, [
        'pagesJaunesUrl',
        'pages_jaunes_url',
        'pagesJaunes',
        'pjUrl',
      ]),
    }
  }

  /**
   * Lit la source d'email parmi les valeurs supportees pour l'import (website_scrape | pages_jaunes).
   * @param {N8nPayload} payload - Item n8n brut.
   * @returns {LocalBusinessEmailSource.WEBSITE_SCRAPE | LocalBusinessEmailSource.PAGES_JAUNES | null} Source ou null.
   */
  private static readEmailSource(
    payload: N8nPayload,
  ): LocalBusinessEmailSource.WEBSITE_SCRAPE | LocalBusinessEmailSource.PAGES_JAUNES | null {
    const value: string | null = LocalBusinessImportEnrichmentService.readString(payload, [
      'emailSource',
      'email_source',
    ])
    if (value === LocalBusinessEmailSource.PAGES_JAUNES) {
      return LocalBusinessEmailSource.PAGES_JAUNES
    }
    if (value === LocalBusinessEmailSource.WEBSITE_SCRAPE) {
      return LocalBusinessEmailSource.WEBSITE_SCRAPE
    }
    return null
  }

  /**
   * Lit une chaine depuis les alias n8n connus.
   * @param {N8nPayload} payload - Objet n8n.
   * @param {string[]} aliases - Cles candidates.
   * @returns {string | null} Valeur trimme ou null.
   */
  private static readString(payload: N8nPayload, aliases: string[]): string | null {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
    return null
  }

  /**
   * Lit un booleen depuis les alias n8n connus.
   * Accepte aussi "true" / "false" en chaine et 0 / 1.
   * @param {N8nPayload} payload - Objet n8n.
   * @param {string[]} aliases - Cles candidates.
   * @returns {boolean | null} Valeur ou null si absente.
   */
  private static readBoolean(payload: N8nPayload, aliases: string[]): boolean | null {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'boolean') {
        return value
      }
      if (typeof value === 'string') {
        const lower: string = value.trim().toLowerCase()
        if (lower === 'true') return true
        if (lower === 'false') return false
      }
      if (typeof value === 'number') {
        if (value === 1) return true
        if (value === 0) return false
      }
    }
    return null
  }

  /**
   * Verifie qu'une valeur est un objet JSON exploitable.
   * @param {unknown} value - Valeur a tester.
   * @returns {value is N8nPayload} True si objet non-tableau.
   */
  private static isPayload(value: unknown): value is N8nPayload {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
