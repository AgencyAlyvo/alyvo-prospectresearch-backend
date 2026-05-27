import { DateTime } from 'luxon'
import LocalBusinessProspectModel from '#models/local_business_prospect'
import LocalBusinessProspectService from '#services/local_business_prospect_service'
import LocalBusinessEnrichmentService, {
  type LocalBusinessEnrichmentResponse,
} from '#services/local_business_enrichment_service'
import LocalBusinessImportService from '#services/local_business_import_service'
import LocalBusinessProspectTransformer from '#transformers/local_business_prospect_transformer'
import {
  bulkImportFromOsmValidator,
  createLocalBusinessProspectValidator,
  listLocalBusinessProspectsValidator,
  searchOsmValidator,
  updateLocalBusinessProspectValidator,
} from '#validators/local_business/local_business_prospect_validator'
import { prospectBulkActionValidator } from '#validators/shared/prospect_bulk_action_validator'
import type { ProspectBulkActionPayload, ProspectBulkActionResult } from '#types/payload/prospect_bulk_action_payload'
import type { ProspectActionType } from '#enums/prospect_action_type'
import type { CreateLocalBusinessProspectPayload } from '#types/payload/local_business/create_local_business_prospect_payload'
import type { UpdateLocalBusinessProspectPayload } from '#types/payload/local_business/update_local_business_prospect_payload'
import type { ListLocalBusinessProspectsQuery } from '#types/payload/local_business/list_local_business_prospects_query'
import type { OsmSearchResult, SearchOsmPayload } from '#types/payload/local_business/search_osm_payload'
import type { BulkImportFromOsmPayload } from '#types/payload/local_business/bulk_import_payload'
import { normalizeExternalUrl, normalizeImportEmail } from '#utils/external_url'
import type {
  LocalBusinessProspectFullResponse,
  LocalBusinessProspectSummaryResponse,
} from '#types/response/local_business/local_business_prospect_response'
import type { HttpContext } from '@adonisjs/core/http'
import type LocalBusinessProspect from '#models/local_business_prospect'
import type User from '#models/user'

/**
 * Controleur des business locaux (parallele de LinkedinProspectsController).
 * Aucun envoi automatique : toutes les routes journalisent une action mais ne contactent
 * jamais directement le prospect.
 */
export default class LocalBusinessProspectsController {
  /**
   * @summary Liste paginee des business locaux
   * @description Renvoie la liste filtree, triee et paginee de l'utilisateur.
   * @responseBody 200 - Liste paginee
   */
  public async listLocalBusinessProspects({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const query: ListLocalBusinessProspectsQuery = (await request.validateUsing(
      listLocalBusinessProspectsValidator,
    )) as ListLocalBusinessProspectsQuery
    const user: User = auth.user!
    const paginator: Awaited<ReturnType<typeof LocalBusinessProspectService.listLocalBusinessProspects>> =
      await LocalBusinessProspectService.listLocalBusinessProspects(query, user)
    const items: LocalBusinessProspectSummaryResponse[] = paginator
      .all()
      .map(
        (p: LocalBusinessProspect): LocalBusinessProspectSummaryResponse =>
          new LocalBusinessProspectTransformer(p).toObject(),
      )
    return serialize.withoutWrapping({
      data: items,
      meta: {
        total: paginator.total,
        perPage: paginator.perPage,
        currentPage: paginator.currentPage,
        lastPage: paginator.lastPage,
      },
    })
  }

  /**
   * @summary Business locaux de la semaine
   * @description Renvoie les business de la semaine ISO demandee.
   */
  public async listWeeklyLocalBusinessProspects({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const week: string | undefined = request.input('week')
    const prospects: LocalBusinessProspect[] = await LocalBusinessProspectService.listWeeklyLocalBusinessProspects(
      week,
      auth.user!,
    )
    const items: LocalBusinessProspectSummaryResponse[] = prospects.map(
      (p: LocalBusinessProspect): LocalBusinessProspectSummaryResponse =>
        new LocalBusinessProspectTransformer(p).toObject(),
    )
    return serialize.withoutWrapping({ data: items })
  }

  /**
   * @summary Fiche business local
   * @description Renvoie le business complet avec sa timeline.
   * @responseBody 200 - Fiche complete
   * @responseBody 404 - Business introuvable
   */
  public async getLocalBusinessProspect({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.getLocalBusinessProspect(
      Number(params.id),
      auth.user!,
    )
    const full: LocalBusinessProspectFullResponse = new LocalBusinessProspectTransformer(prospect).toFullObject()
    return serialize(full)
  }

  /**
   * @summary Cree un business local
   * @description Cree un business apres deduplication (cle OSM, email, nom+ville).
   * @requestBody <CreateLocalBusinessProspectPayload>
   * @responseBody 200 - Business cree
   * @responseBody 409 - Doublon detecte
   */
  public async createLocalBusinessProspect({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: CreateLocalBusinessProspectPayload = (await request.validateUsing(
      createLocalBusinessProspectValidator,
    )) as CreateLocalBusinessProspectPayload
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.createLocalBusinessProspect(
      payload,
      auth.user!,
    )
    return serialize(new LocalBusinessProspectTransformer(prospect).toObject())
  }

  /**
   * @summary Met a jour un business local
   * @description Met a jour les champs metiers et synchronise les jalons.
   * @requestBody <UpdateLocalBusinessProspectPayload>
   * @responseBody 200 - Business mis a jour
   */
  public async updateLocalBusinessProspect({ params, request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: UpdateLocalBusinessProspectPayload = (await request.validateUsing(
      updateLocalBusinessProspectValidator,
    )) as UpdateLocalBusinessProspectPayload
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.updateLocalBusinessProspect(
      Number(params.id),
      payload,
      auth.user!,
    )
    return serialize(new LocalBusinessProspectTransformer(prospect).toFullObject())
  }

  /**
   * @summary Supprime un business local
   * @responseBody 204 - Supprime
   */
  public async deleteLocalBusinessProspect({ params, auth, response }: HttpContext): Promise<void> {
    await LocalBusinessProspectService.deleteLocalBusinessProspect(Number(params.id), auth.user!)
    response.noContent()
  }

  /**
   * Actions groupées sur une selection de business locaux (favoris, suppression).
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Nombre de lignes impactees.
   */
  public async bulkLocalBusinessProspectAction({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: ProspectBulkActionPayload = (await request.validateUsing(
      prospectBulkActionValidator,
    )) as ProspectBulkActionPayload
    const result: ProspectBulkActionResult = await LocalBusinessProspectService.bulkLocalBusinessProspectAction(
      payload.ids,
      payload.action,
      auth.user!,
    )
    return serialize.withoutWrapping(result)
  }

  /**
   * @summary Marque une action manuelle (email envoye, appel passe, etc.)
   * @responseBody 200 - Business synchronise
   */
  public async markLocalBusinessProspectAction({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const actionType: ProspectActionType = params.action_type as ProspectActionType
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.markLocalBusinessProspectAction(
      Number(params.id),
      actionType,
      auth.user!,
    )
    return serialize(new LocalBusinessProspectTransformer(prospect).toObject())
  }

  /**
   * @summary Enrichit un business local via n8n
   * @description Recupere email site/Facebook + scores Lighthouse depuis n8n.
   * @responseBody 200 - Business mis a jour
   */
  public async enrichLocalBusinessProspect({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.getLocalBusinessProspect(
      Number(params.id),
      auth.user!,
    )
    const enrichment: LocalBusinessEnrichmentResponse = await LocalBusinessEnrichmentService.enrich(prospect)
    const payload: UpdateLocalBusinessProspectPayload = {
      ...(enrichment.email ? { email: enrichment.email } : {}),
      ...(enrichment.emailSource ? { emailSource: enrichment.emailSource as never } : {}),
      ...(enrichment.phone ? { phone: enrichment.phone } : {}),
      ...(enrichment.facebookUrl ? { facebookUrl: enrichment.facebookUrl } : {}),
      ...(enrichment.instagramUrl ? { instagramUrl: enrichment.instagramUrl } : {}),
      ...(enrichment.seoScore !== null && enrichment.seoScore !== undefined ? { seoScore: enrichment.seoScore } : {}),
      ...(enrichment.performanceScore !== null && enrichment.performanceScore !== undefined
        ? { performanceScore: enrichment.performanceScore }
        : {}),
      ...(enrichment.accessibilityScore !== null && enrichment.accessibilityScore !== undefined
        ? { accessibilityScore: enrichment.accessibilityScore }
        : {}),
      ...(enrichment.bestPracticesScore !== null && enrichment.bestPracticesScore !== undefined
        ? { bestPracticesScore: enrichment.bestPracticesScore }
        : {}),
    }
    const updated: LocalBusinessProspect = await LocalBusinessProspectService.updateLocalBusinessProspect(
      prospect.id,
      payload,
      auth.user!,
    )
    updated.enrichedAt = DateTime.now()
    if (payload.seoScore !== undefined || payload.performanceScore !== undefined) {
      updated.lighthouseFetchedAt = DateTime.now()
    }
    await updated.save()
    return serialize(new LocalBusinessProspectTransformer(updated).toFullObject())
  }

  /**
   * @summary Recherche dans OSM par ville
   * @description Preview des resultats OSM correspondant a une ville (sans persister).
   *              Exclut automatiquement les business deja presents dans la base de l'utilisateur
   *              (matche par couple osm_type + osm_id) pour ne pas re-proposer des doublons.
   * @responseBody 200 - Liste de resultats OSM
   */
  public async searchOsmByCity({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: SearchOsmPayload = (await request.validateUsing(searchOsmValidator)) as SearchOsmPayload
    const user: User = auth.user!
    const results: OsmSearchResult[] = await LocalBusinessImportService.searchByCity(payload.city, {
      category: payload.category,
      limit: payload.limit,
    })

    const existing: LocalBusinessProspectModel[] = await LocalBusinessProspectModel.query()
      .where('user_id', user.id)
      .whereNotNull('osm_type')
      .whereNotNull('osm_id')
      .select('osm_type', 'osm_id')
    const existingKeys: Set<string> = new Set(
      existing.map((p: LocalBusinessProspectModel): string => `${p.osmType}:${p.osmId}`),
    )

    const filtered: OsmSearchResult[] = results.filter(
      (r: OsmSearchResult): boolean => !existingKeys.has(`${r.osmType}:${r.osmId}`),
    )
    return serialize.withoutWrapping({
      data: filtered,
      meta: { rawCount: results.length, filteredCount: filtered.length },
    })
  }

  /**
   * @summary Import en masse depuis OSM
   * @description Cree des business locaux depuis une liste de resultats OSM (apres preview).
   * @requestBody <BulkImportFromOsmPayload>
   * @responseBody 200 - Statistiques d'import
   */
  public async bulkImportFromOsm({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: BulkImportFromOsmPayload = (await request.validateUsing(
      bulkImportFromOsmValidator,
    )) as BulkImportFromOsmPayload
    const stats: { inserted: number; skipped: number } = await LocalBusinessProspectService.bulkCreateFromOsm(
      payload.items.map((item: OsmSearchResult) => ({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        osmType: item.osmType,
        osmId: item.osmId,
        address: item.address,
        city: item.city,
        postalCode: item.postalCode,
        region: item.region,
        country: 'France',
        latitude: item.latitude,
        longitude: item.longitude,
        phone: item.phone,
        email: normalizeImportEmail(item.email),
        website: normalizeExternalUrl(item.website),
        facebookUrl: normalizeExternalUrl(item.facebookUrl),
        openingHours: item.openingHours,
      })),
      auth.user!,
    )
    return serialize.withoutWrapping(stats)
  }
}
