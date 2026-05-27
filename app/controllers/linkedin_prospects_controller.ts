import LinkedinProspectService from '#services/linkedin_prospect_service'
import LinkedinRelanceService from '#services/linkedin_relance_service'
import LinkedinProfileEnrichmentService from '#services/linkedin_profile_enrichment_service'
import LinkedinProspectTransformer from '#transformers/linkedin_prospect_transformer'
import {
  createLinkedinProspectValidator,
  enrichLinkedinProspectValidator,
  listLinkedinProspectsValidator,
  updateLinkedinProspectValidator,
} from '#validators/linkedin/linkedin_prospect_validator'
import { prospectBulkActionValidator } from '#validators/shared/prospect_bulk_action_validator'
import type { ProspectBulkActionPayload, ProspectBulkActionResult } from '#types/payload/prospect_bulk_action_payload'
import type { ProspectActionType } from '#enums/prospect_action_type'
import type { CreateLinkedinProspectPayload } from '#types/payload/linkedin/create_linkedin_prospect_payload'
import type { EnrichLinkedinProspectPayload } from '#types/payload/linkedin/enrich_linkedin_prospect_payload'
import type { UpdateLinkedinProspectPayload } from '#types/payload/linkedin/update_linkedin_prospect_payload'
import type { ListLinkedinProspectsQuery } from '#types/payload/linkedin/list_linkedin_prospects_query'
import type {
  LinkedinProspectFullResponse,
  LinkedinProspectSummaryResponse,
} from '#types/response/linkedin/linkedin_prospect_response'
import type { HttpContext } from '@adonisjs/core/http'
import type LinkedinProspect from '#models/linkedin_prospect'
import type User from '#models/user'

/**
 * Controleur des prospects LinkedIn (cahier paragraphes 5, 6, 7).
 * Aucun envoi automatique : toutes les routes journalisent une action mais
 * ne contactent jamais LinkedIn ou la messagerie externe.
 */
export default class LinkedinProspectsController {
  /**
   * @summary Liste paginee des prospects LinkedIn
   * @description Renvoie la liste filtree, triee et paginee des prospects LinkedIn de l'utilisateur.
   * @responseBody 200 - Liste paginee
   */
  /**
   * Liste paginee des prospects LinkedIn.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async listLinkedinProspects({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const query: ListLinkedinProspectsQuery = (await request.validateUsing(
      listLinkedinProspectsValidator,
    )) as ListLinkedinProspectsQuery
    const user: User = auth.user!
    const paginator: Awaited<ReturnType<typeof LinkedinProspectService.listLinkedinProspects>> =
      await LinkedinProspectService.listLinkedinProspects(query, user)
    const items: LinkedinProspectSummaryResponse[] = paginator
      .all()
      .map((p: LinkedinProspect): LinkedinProspectSummaryResponse => new LinkedinProspectTransformer(p).toObject())
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
   * @summary Prospects LinkedIn de la semaine
   * @description Renvoie les prospects de la semaine ISO demandee (default: courante).
   * @responseBody 200 - Liste des prospects de la semaine
   */
  /**
   * Liste les prospects LinkedIn de la semaine ISO demandee.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async listWeeklyLinkedinProspects({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const week: string | undefined = request.input('week')
    const prospects: LinkedinProspect[] = await LinkedinProspectService.listWeeklyLinkedinProspects(week, auth.user!)
    const items: LinkedinProspectSummaryResponse[] = prospects.map(
      (p: LinkedinProspect): LinkedinProspectSummaryResponse => new LinkedinProspectTransformer(p).toObject(),
    )
    return serialize.withoutWrapping({ data: items })
  }

  /**
   * @summary Relances LinkedIn dues
   * @description Liste les prospects dont une relance est due selon message1SentAt et les delais utilisateur.
   * @responseBody 200 - Liste des relances dues
   */
  /**
   * Liste les relances LinkedIn dues.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async listDueLinkedinRelances({ auth, serialize }: HttpContext): Promise<unknown> {
    const dueRelances: Awaited<ReturnType<typeof LinkedinRelanceService.listDueRelances>> =
      await LinkedinRelanceService.listDueRelances(auth.user!)
    return serialize.withoutWrapping({ data: dueRelances })
  }

  /**
   * @summary Fiche prospect LinkedIn
   * @description Renvoie le prospect complet avec sa timeline d'actions.
   * @responseBody 200 - Fiche complete
   * @responseBody 404 - Prospect introuvable
   */
  /**
   * Charge un prospect avec sa timeline.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async getLinkedinProspect({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const prospect: LinkedinProspect = await LinkedinProspectService.getLinkedinProspect(Number(params.id), auth.user!)
    const full: LinkedinProspectFullResponse = new LinkedinProspectTransformer(prospect).toFullObject()
    return serialize(full)
  }

  /**
   * @summary Cree un prospect LinkedIn
   * @description Cree un prospect apres deduplication (cahier paragraphe 17.1).
   * @requestBody <CreateLinkedinProspectPayload>
   * @responseBody 200 - Prospect cree
   * @responseBody 409 - Doublon detecte
   */
  /**
   * Cree un prospect LinkedIn.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async createLinkedinProspect({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: CreateLinkedinProspectPayload = (await request.validateUsing(
      createLinkedinProspectValidator,
    )) as CreateLinkedinProspectPayload
    const prospect: LinkedinProspect = await LinkedinProspectService.createLinkedinProspect(payload, auth.user!)
    return serialize(new LinkedinProspectTransformer(prospect).toObject())
  }

  /**
   * @summary Enrichit un prospect LinkedIn
   * @description Appelle n8n pour recuperer les champs connus depuis l'URL LinkedIn.
   * @requestBody <EnrichLinkedinProspectPayload>
   * @responseBody 200 - Donnees prospect pre-remplies
   */
  /**
   * Enrichit un prospect depuis son URL LinkedIn sans le creer.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async enrichLinkedinProspect({ request, serialize }: HttpContext): Promise<unknown> {
    const payload: EnrichLinkedinProspectPayload = (await request.validateUsing(
      enrichLinkedinProspectValidator,
    )) as EnrichLinkedinProspectPayload
    const prospect: Partial<CreateLinkedinProspectPayload> = await LinkedinProfileEnrichmentService.enrich(
      payload.linkedinUrl,
    )
    return serialize(prospect)
  }

  /**
   * @summary Met a jour un prospect LinkedIn
   * @description Met a jour les champs metiers et synchronise les jalons du tunnel.
   * @requestBody <UpdateLinkedinProspectPayload>
   * @responseBody 200 - Prospect mis a jour
   */
  /**
   * Met a jour un prospect LinkedIn existant.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async updateLinkedinProspect({ params, request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: UpdateLinkedinProspectPayload = (await request.validateUsing(
      updateLinkedinProspectValidator,
    )) as UpdateLinkedinProspectPayload
    const prospect: LinkedinProspect = await LinkedinProspectService.updateLinkedinProspect(
      Number(params.id),
      payload,
      auth.user!,
    )
    return serialize(new LinkedinProspectTransformer(prospect).toFullObject())
  }

  /**
   * @summary Rafraichit un prospect LinkedIn via n8n
   * @description Relance l'enrichissement depuis l'URL LinkedIn du prospect et met a jour sa fiche.
   * @responseBody 200 - Prospect mis a jour
   */
  /**
   * Rafraichit un prospect LinkedIn existant depuis n8n.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async refreshLinkedinProspect({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const prospect: LinkedinProspect = await LinkedinProspectService.refreshLinkedinProspect(
      Number(params.id),
      auth.user!,
    )
    return serialize(new LinkedinProspectTransformer(prospect).toObject())
  }

  /**
   * @summary Supprime un prospect LinkedIn
   * @description Supprime definitivement le prospect et sa timeline.
   * @responseBody 204 - Supprime
   */
  /**
   * Supprime un prospect LinkedIn.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<void>}
   */
  public async deleteLinkedinProspect({ params, auth, response }: HttpContext): Promise<void> {
    await LinkedinProspectService.deleteLinkedinProspect(Number(params.id), auth.user!)
    response.noContent()
  }

  /**
   * Actions groupées sur une selection de prospects LinkedIn (favoris, suppression).
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Nombre de lignes impactees.
   */
  public async bulkLinkedinProspectAction({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: ProspectBulkActionPayload = (await request.validateUsing(
      prospectBulkActionValidator,
    )) as ProspectBulkActionPayload
    const result: ProspectBulkActionResult = await LinkedinProspectService.bulkLinkedinProspectAction(
      payload.ids,
      payload.action,
      auth.user!,
    )
    return serialize.withoutWrapping(result)
  }

  /**
   * @summary Marque une action LinkedIn manuelle
   * @description Journalise une action realisee manuellement par l'utilisateur sur LinkedIn.
   *              Aucun envoi reel n'est effectue (cahier paragraphe 18.1).
   * @responseBody 200 - Prospect synchronise
   * @responseBody 422 - Limite hebdomadaire d'invitations atteinte
   */
  /**
   * Marque une action LinkedIn manuelle (invitation envoyee, acceptee, relance, etc.).
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async markLinkedinProspectAction({ params, auth, serialize }: HttpContext): Promise<unknown> {
    const actionType: ProspectActionType = params.action_type as ProspectActionType
    const prospect: LinkedinProspect = await LinkedinProspectService.markLinkedinProspectAction(
      Number(params.id),
      actionType,
      auth.user!,
    )
    return serialize(new LinkedinProspectTransformer(prospect).toObject())
  }
}
