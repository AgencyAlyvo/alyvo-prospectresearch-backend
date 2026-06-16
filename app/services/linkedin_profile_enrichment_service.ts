import env from '#start/env'
import LinkedinProfileEnrichmentException from '#exceptions/linkedin_profile_enrichment_exception'
import type { CreateLinkedinProspectPayload } from '#types/payload/linkedin/create_linkedin_prospect_payload'

/**
 * Objet JSON retourne par n8n apres execution du workflow.
 */
type N8nPayload = Record<string, unknown>

/**
 * Champs texte que l'enrichissement peut pre-remplir.
 */
type EnrichableStringField = Exclude<
  keyof CreateLinkedinProspectPayload,
  'status' | 'openToWork' | 'hiring' | 'connectionsCount' | 'followerCount'
>

/**
 * Champs numeriques que l'enrichissement peut pre-remplir.
 */
type EnrichableNumberField = 'connectionsCount' | 'followerCount'

/**
 * Champs booleens que l'enrichissement peut pre-remplir.
 */
type EnrichableBooleanField = 'openToWork' | 'hiring'

/**
 * Service d'enrichissement d'un profil LinkedIn via un webhook n8n.
 */
export default class LinkedinProfileEnrichmentService {
  private static readonly fieldAliases: Record<EnrichableStringField, string[]> = {
    firstName: ['firstName', 'first_name', 'prenom', 'prénom'],
    lastName: ['lastName', 'last_name', 'nom'],
    position: ['position', 'poste', 'title', 'jobTitle', 'job_title', 'headline'],
    company: ['company', 'entreprise', 'currentCompany', 'current_company'],
    industry: ['industry', 'secteur'],
    city: ['city', 'ville', 'locationCity', 'location_city'],
    region: ['region', 'locationRegion', 'location_region'],
    country: ['country', 'pays'],
    profileHeadline: ['profileHeadline', 'profile_headline', 'headline'],
    linkedinUrl: ['linkedinUrl', 'linkedin_url', 'url', 'profileUrl', 'profile_url'],
    companyLinkedinUrl: ['companyLinkedinUrl', 'company_linkedin_url', 'companyUrl', 'company_url'],
    websiteUrl: ['websiteUrl', 'website_url', 'website', 'siteWeb', 'site_web'],
    email: ['email', 'emailAddress', 'email_address'],
    phone: ['phone', 'telephone', 'téléphone', 'phoneNumber', 'phone_number'],
    companyEmployeeCountRange: ['companyEmployeeCountRange', 'company_employee_count_range', 'employeeCountRange'],
    companyType: ['companyType', 'company_type'],
    companyTagline: ['companyTagline', 'company_tagline', 'tagline'],
    companyDescription: ['companyDescription', 'company_description'],
  }

  private static readonly numberFieldAliases: Record<EnrichableNumberField, string[]> = {
    connectionsCount: ['connectionsCount', 'connections_count'],
    followerCount: ['followerCount', 'follower_count'],
  }

  private static readonly booleanFieldAliases: Record<EnrichableBooleanField, string[]> = {
    openToWork: ['openToWork', 'open_to_work'],
    hiring: ['hiring'],
  }

  /**
   * Appelle n8n et normalise la reponse en payload prospect partiel.
   * @param {string} linkedinUrl - URL LinkedIn a enrichir.
   * @returns {Promise<Partial<CreateLinkedinProspectPayload>>} Champs detectes.
   */
  public static async enrich(linkedinUrl: string): Promise<Partial<CreateLinkedinProspectPayload>> {
    const webhookUrl: string | undefined = env.get('N8N_LINKEDIN_ENRICHMENT_WEBHOOK_URL')
    if (!webhookUrl) {
      throw new LinkedinProfileEnrichmentException("Webhook n8n d'enrichissement LinkedIn non configure", 503)
    }

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: LinkedinProfileEnrichmentService.buildHeaders(),
        body: JSON.stringify({ linkedinUrl }),
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error: unknown) {
      const detail: string = error instanceof Error ? error.message : String(error)
      throw new LinkedinProfileEnrichmentException(`Impossible de joindre le webhook n8n (${detail})`)
    }

    if (!response.ok) {
      throw new LinkedinProfileEnrichmentException(`n8n a retourne une erreur (${response.status})`)
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new LinkedinProfileEnrichmentException('n8n doit retourner une reponse JSON')
    }
    const normalized: Partial<CreateLinkedinProspectPayload> = LinkedinProfileEnrichmentService.normalizeResponse(
      body,
      linkedinUrl,
    )

    if (!normalized.firstName || !normalized.lastName) {
      throw new LinkedinProfileEnrichmentException("n8n n'a pas retourne le prenom et le nom du prospect", 422)
    }

    return normalized
  }

  /**
   * Prepare les headers envoyes au webhook.
   * @returns {Record<string, string>} Headers HTTP.
   */
  private static buildHeaders(): Record<string, string> {
    const secret: string | undefined = env.get('N8N_LINKEDIN_ENRICHMENT_WEBHOOK_HEADER_SECRET')
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Alyvo-Webhook-Secret': secret } : {}),
    }
  }

  /**
   * Normalise les formats courants de reponse n8n.
   * @param {unknown} body - Corps de reponse brut.
   * @param {string} linkedinUrl - URL source.
   * @returns {Partial<CreateLinkedinProspectPayload>} Payload normalise.
   */
  private static normalizeResponse(body: unknown, linkedinUrl: string): Partial<CreateLinkedinProspectPayload> {
    const item: N8nPayload = LinkedinProfileEnrichmentService.extractPayload(body)
    const prospect: Partial<CreateLinkedinProspectPayload> = { linkedinUrl }

    for (const [field, aliases] of Object.entries(LinkedinProfileEnrichmentService.fieldAliases) as [
      EnrichableStringField,
      string[],
    ][]) {
      const value: string | undefined = LinkedinProfileEnrichmentService.readString(item, aliases)
      if (value) {
        prospect[field] = value
      }
    }
    for (const [field, aliases] of Object.entries(LinkedinProfileEnrichmentService.numberFieldAliases) as [
      EnrichableNumberField,
      string[],
    ][]) {
      const value: number | undefined = LinkedinProfileEnrichmentService.readNumber(item, aliases)
      if (value !== undefined) {
        prospect[field] = value
      }
    }
    for (const [field, aliases] of Object.entries(LinkedinProfileEnrichmentService.booleanFieldAliases) as [
      EnrichableBooleanField,
      string[],
    ][]) {
      const value: boolean | undefined = LinkedinProfileEnrichmentService.readBoolean(item, aliases)
      if (value !== undefined) {
        prospect[field] = value
      }
    }

    LinkedinProfileEnrichmentService.applyFullNameFallback(prospect, item)
    prospect.linkedinUrl = prospect.linkedinUrl ?? linkedinUrl
    return prospect
  }

  /**
   * Decoupe un nom complet si n8n ne renvoie pas prenom/nom separes.
   * @param {Partial<CreateLinkedinProspectPayload>} prospect - Payload en cours.
   * @param {N8nPayload} item - Donnees source.
   * @returns {void}
   */
  private static applyFullNameFallback(prospect: Partial<CreateLinkedinProspectPayload>, item: N8nPayload): void {
    if (prospect.firstName && prospect.lastName) {
      return
    }

    const fullName: string | undefined = LinkedinProfileEnrichmentService.readString(item, [
      'fullName',
      'full_name',
      'name',
      'nomComplet',
      'nom_complet',
    ])
    if (!fullName) {
      return
    }

    const parts: string[] = fullName.split(/\s+/).filter(Boolean)
    if (!prospect.firstName) {
      prospect.firstName = parts.shift()
    }
    if (!prospect.lastName && parts.length > 0) {
      prospect.lastName = parts.join(' ')
    }
  }

  /**
   * Extrait l'objet utile depuis une reponse n8n brute.
   * @param {unknown} body - Corps de reponse.
   * @returns {N8nPayload} Objet exploitable.
   */
  private static extractPayload(body: unknown): N8nPayload {
    if (Array.isArray(body)) {
      return LinkedinProfileEnrichmentService.extractPayload(body[0])
    }
    if (LinkedinProfileEnrichmentService.isPayload(body)) {
      const nested: unknown = body.data ?? body.json ?? body.prospect ?? body.profile
      if (LinkedinProfileEnrichmentService.isPayload(nested)) {
        return nested
      }
      return body
    }
    return {}
  }

  /**
   * Lit la premiere valeur string non vide parmi une liste d'alias.
   * @param {N8nPayload} payload - Objet source.
   * @param {string[]} aliases - Alias possibles.
   * @returns {string | undefined} Valeur normalisee.
   */
  private static readString(payload: N8nPayload, aliases: string[]): string | undefined {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
    return undefined
  }

  /**
   * Lit la premiere valeur numerique parmi une liste d'alias.
   * @param {N8nPayload} payload - Objet source.
   * @param {string[]} aliases - Alias possibles.
   * @returns {number | undefined} Valeur normalisee.
   */
  private static readNumber(payload: N8nPayload, aliases: string[]): number | undefined {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value
      }
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
        return Number(value)
      }
    }
    return undefined
  }

  /**
   * Lit la premiere valeur booleenne parmi une liste d'alias.
   * @param {N8nPayload} payload - Objet source.
   * @param {string[]} aliases - Alias possibles.
   * @returns {boolean | undefined} Valeur normalisee.
   */
  private static readBoolean(payload: N8nPayload, aliases: string[]): boolean | undefined {
    for (const alias of aliases) {
      const value: unknown = payload[alias]
      if (typeof value === 'boolean') {
        return value
      }
      if (typeof value === 'string') {
        const normalized: string = value.trim().toLowerCase()
        if (normalized === 'true') return true
        if (normalized === 'false') return false
      }
    }
    return undefined
  }

  /**
   * Indique si une valeur est un objet exploitable.
   * @param {unknown} value - Valeur a tester.
   * @returns {value is N8nPayload} True si objet simple.
   */
  private static isPayload(value: unknown): value is N8nPayload {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
