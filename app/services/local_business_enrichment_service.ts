import env from '#start/env'
import LocalBusinessEnrichmentException from '#exceptions/local_business_enrichment_exception'
import type LocalBusinessProspect from '#models/local_business_prospect'

/**
 * Reponse attendue du webhook n8n d'enrichissement business local.
 */
export type LocalBusinessEnrichmentResponse = {
  email?: string | null
  emailSource?: string | null
  phone?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  seoScore?: number | null
  performanceScore?: number | null
  accessibilityScore?: number | null
  bestPracticesScore?: number | null
}

/**
 * Objet JSON generique renvoye par n8n.
 */
type N8nPayload = Record<string, unknown>

/**
 * Service d'enrichissement d'un business local via un webhook n8n.
 *
 * Le workflow n8n est cense :
 *   1. Appeler Google PageSpeed Insights (si website) -> scores Lighthouse
 *   2. Scraper /contact /about /mentions-legales -> extraire email mailto
 *   3. Scraper la page Facebook publique (si facebookUrl) -> email visible
 *   4. Retourner les champs detectes
 */
export default class LocalBusinessEnrichmentService {
  /**
   * Appelle n8n et normalise la reponse en payload d'update partiel.
   * @param {LocalBusinessProspect} prospect - Prospect a enrichir.
   * @returns {Promise<LocalBusinessEnrichmentResponse>} Champs detectes.
   */
  public static async enrich(prospect: LocalBusinessProspect): Promise<LocalBusinessEnrichmentResponse> {
    const webhookUrl: string | undefined = env.get('N8N_LOCAL_BUSINESS_ENRICHMENT_WEBHOOK_URL')
    if (!webhookUrl) {
      throw new LocalBusinessEnrichmentException("Webhook n8n d'enrichissement business local non configure", 503)
    }

    const body: N8nPayload = {
      id: prospect.id,
      name: prospect.name,
      city: prospect.city,
      website: prospect.website,
      facebookUrl: prospect.facebookUrl,
      phone: prospect.phone,
    }

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: LocalBusinessEnrichmentService.buildHeaders(),
        body: JSON.stringify(body),
      })
    } catch {
      throw new LocalBusinessEnrichmentException('Impossible de joindre le webhook n8n')
    }

    if (!response.ok) {
      throw new LocalBusinessEnrichmentException(`n8n a retourne une erreur (${response.status})`)
    }

    let json: unknown
    try {
      json = await response.json()
    } catch {
      throw new LocalBusinessEnrichmentException('n8n doit retourner une reponse JSON')
    }

    return LocalBusinessEnrichmentService.normalizeResponse(json)
  }

  /**
   * Prepare les headers envoyes au webhook.
   * @returns {Record<string, string>} Headers HTTP.
   */
  private static buildHeaders(): Record<string, string> {
    const secret: string | undefined = env.get('N8N_LOCAL_BUSINESS_ENRICHMENT_WEBHOOK_HEADER_SECRET')
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Alyvo-Webhook-Secret': secret } : {}),
    }
  }

  /**
   * Normalise la reponse n8n (tolere array, json, data, etc.).
   * @param {unknown} body - Corps brut.
   * @returns {LocalBusinessEnrichmentResponse} Donnees exploitables.
   */
  private static normalizeResponse(body: unknown): LocalBusinessEnrichmentResponse {
    const item: N8nPayload = LocalBusinessEnrichmentService.extractPayload(body)
    return {
      email: LocalBusinessEnrichmentService.readString(item, ['email', 'emailAddress', 'email_address']),
      emailSource: LocalBusinessEnrichmentService.readString(item, ['emailSource', 'email_source']),
      phone: LocalBusinessEnrichmentService.readString(item, ['phone', 'telephone', 'phone_number']),
      facebookUrl: LocalBusinessEnrichmentService.readString(item, ['facebookUrl', 'facebook_url', 'facebook']),
      instagramUrl: LocalBusinessEnrichmentService.readString(item, ['instagramUrl', 'instagram_url', 'instagram']),
      seoScore: LocalBusinessEnrichmentService.readNumber(item, ['seoScore', 'seo_score', 'seo']),
      performanceScore: LocalBusinessEnrichmentService.readNumber(item, [
        'performanceScore',
        'performance_score',
        'performance',
        'perfScore',
      ]),
      accessibilityScore: LocalBusinessEnrichmentService.readNumber(item, [
        'accessibilityScore',
        'accessibility_score',
        'a11yScore',
        'accessibility',
      ]),
      bestPracticesScore: LocalBusinessEnrichmentService.readNumber(item, [
        'bestPracticesScore',
        'best_practices_score',
        'bpScore',
        'bestPractices',
      ]),
    }
  }

  /**
   * Extrait l'objet utile depuis une reponse n8n brute.
   * @param {unknown} body - Corps brut n8n.
   * @returns {N8nPayload} Objet exploitable.
   */
  private static extractPayload(body: unknown): N8nPayload {
    if (Array.isArray(body)) {
      return LocalBusinessEnrichmentService.extractPayload(body[0])
    }
    if (LocalBusinessEnrichmentService.isPayload(body)) {
      const nested: unknown = body.data ?? body.json ?? body.business ?? body.result
      if (LocalBusinessEnrichmentService.isPayload(nested)) {
        return nested
      }
      return body
    }
    return {}
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
   * Lit un nombre depuis les alias n8n connus.
   * @param {N8nPayload} payload - Objet n8n.
   * @param {string[]} aliases - Cles candidates.
   * @returns {number | null} Valeur numerique ou null.
   */
  private static readNumber(payload: N8nPayload, aliases: string[]): number | null {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value
      }
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
        return Number(value)
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
