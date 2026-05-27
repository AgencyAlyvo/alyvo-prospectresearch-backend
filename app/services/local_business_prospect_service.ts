import { DateTime } from 'luxon'
import LocalBusinessProspect from '#models/local_business_prospect'
import ProspectAction from '#models/prospect_action'
import type User from '#models/user'
import LocalBusinessProspectNotFoundException from '#exceptions/local_business_prospect_not_found_exception'
import LocalBusinessProspectDuplicateException from '#exceptions/local_business_prospect_duplicate_exception'
import ProspectActionService from '#services/prospect_action_service'
import WeeklyObjectiveService from '#services/weekly_objective_service'
import type { CreateLocalBusinessProspectPayload } from '#types/payload/local_business/create_local_business_prospect_payload'
import type { UpdateLocalBusinessProspectPayload } from '#types/payload/local_business/update_local_business_prospect_payload'
import type { ListLocalBusinessProspectsQuery } from '#types/payload/local_business/list_local_business_prospects_query'
import { parseQueryBoolean } from '#utils/parse_query_boolean'
import { LocalBusinessStatus } from '#enums/local_business_status'
import { LocalBusinessEmailSource } from '#enums/local_business_email_source'
import { ProspectBulkAction } from '#enums/prospect_bulk_action'
import { ProspectActionType } from '#enums/prospect_action_type'
import { ProspectChannel } from '#enums/prospect_channel'
import { ProspectableType } from '#enums/prospectable_type'
import type { ModelAttributes } from '@adonisjs/lucid/types/model'
import type { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

/**
 * Page de resultats Lucid pour les business locaux (alias court).
 */
export type LocalBusinessProspectPaginator = ModelPaginatorContract<LocalBusinessProspect>

/**
 * Service metier principal pour les prospects "business locaux".
 *
 * Responsabilites :
 * - CRUD avec deduplication (cle OSM + email + nom+ville) ;
 * - Marquage manuel des etapes du tunnel ;
 * - Pas d'envoi automatique cote serveur (cohesion avec le pattern LinkedIn).
 */
export default class LocalBusinessProspectService {
  /**
   * Liste paginee des business locaux de l'utilisateur, avec filtres et tri.
   * @param {ListLocalBusinessProspectsQuery} query - Filtres et pagination valides.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspectPaginator>} Page Lucid.
   */
  public static async listLocalBusinessProspects(
    query: ListLocalBusinessProspectsQuery,
    user: User,
  ): Promise<LocalBusinessProspectPaginator> {
    const page: number = query.page ?? 1
    const perPage: number = query.perPage ?? 25
    const sortBy: string = query.sortBy ?? 'createdAt'
    const sortDir: 'asc' | 'desc' = query.sortDir ?? 'desc'

    const builder: ModelQueryBuilderContract<typeof LocalBusinessProspect, LocalBusinessProspect> =
      LocalBusinessProspect.query().where('user_id', user.id)

    if (query.search) {
      const term: string = `%${query.search}%`
      builder.where((sub: ModelQueryBuilderContract<typeof LocalBusinessProspect, LocalBusinessProspect>): void => {
        sub
          .whereILike('name', term)
          .orWhereILike('city', term)
          .orWhereILike('address', term)
          .orWhereILike('subcategory', term)
      })
    }
    if (query.status && query.status.length > 0) {
      builder.whereIn('status', query.status as string[])
    }
    if (query.category) {
      builder.where('subcategory', query.category)
    }
    if (query.city) {
      builder.whereILike('city', `%${query.city}%`)
    }
    if (query.region) {
      builder.where('region', query.region)
    }
    if (query.postalCode) {
      builder.where('postal_code', query.postalCode)
    }
    if (query.hasWebsite !== undefined) {
      builder.where('has_website', query.hasWebsite)
    }
    if (query.hasEmail !== undefined) {
      if (query.hasEmail) {
        builder.whereNotNull('email')
      } else {
        builder.whereNull('email')
      }
    }
    if (query.hasPhone !== undefined) {
      if (query.hasPhone) {
        builder.whereNotNull('phone')
      } else {
        builder.whereNull('phone')
      }
    }
    if (query.seoScoreMax !== undefined) {
      builder.where('seo_score', '<=', query.seoScoreMax)
    }
    if (query.week) {
      builder.where('added_at_week', query.week)
    }
    const favoritesOnly: boolean | undefined = parseQueryBoolean(query.isFavorite)
    if (favoritesOnly !== undefined) {
      builder.where('is_favorite', favoritesOnly)
    }

    builder.orderBy(LocalBusinessProspectService.snakeize(sortBy), sortDir)
    return await builder.paginate(page, perPage)
  }

  /**
   * Liste les business locaux de la semaine ISO demandee.
   * @param {string | undefined} week - Semaine ISO YYYY-Www (default: courante).
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspect[]>} Liste de la semaine.
   */
  public static async listWeeklyLocalBusinessProspects(
    week: string | undefined,
    user: User,
  ): Promise<LocalBusinessProspect[]> {
    const targetWeek: string = week ?? WeeklyObjectiveService.getCurrentIsoWeek()
    return await LocalBusinessProspect.query()
      .where('user_id', user.id)
      .andWhere('added_at_week', targetWeek)
      .orderBy('created_at', 'desc')
  }

  /**
   * Charge un business local avec sa timeline d'actions.
   * @param {number} id - Identifiant.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspect>} Prospect charge.
   * @throws {LocalBusinessProspectNotFoundException} Si introuvable pour cet utilisateur.
   */
  public static async getLocalBusinessProspect(id: number, user: User): Promise<LocalBusinessProspect> {
    const prospect: LocalBusinessProspect | null = await LocalBusinessProspect.query()
      .where('user_id', user.id)
      .andWhere('id', id)
      .preload('actions', (q: ModelQueryBuilderContract<typeof ProspectAction, ProspectAction>): void => {
        q.orderBy('occurred_at', 'desc')
      })
      .first()
    if (!prospect) {
      throw new LocalBusinessProspectNotFoundException()
    }
    return prospect
  }

  /**
   * Cree un business local apres deduplication.
   * @param {CreateLocalBusinessProspectPayload} payload - Donnees validees.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspect>} Prospect cree.
   */
  public static async createLocalBusinessProspect(
    payload: CreateLocalBusinessProspectPayload,
    user: User,
  ): Promise<LocalBusinessProspect> {
    await LocalBusinessProspectService.dedupeLocalBusinessProspect(payload, user)

    const prospect: LocalBusinessProspect = await LocalBusinessProspect.create({
      userId: user.id,
      name: payload.name,
      category: payload.category ?? null,
      subcategory: payload.subcategory ?? null,
      osmType: payload.osmType ?? null,
      osmId: payload.osmId ?? null,
      address: payload.address ?? null,
      city: payload.city ?? null,
      postalCode: payload.postalCode ?? null,
      region: payload.region ?? null,
      country: payload.country ?? 'France',
      latitude: payload.latitude !== undefined && payload.latitude !== null ? String(payload.latitude) : null,
      longitude: payload.longitude !== undefined && payload.longitude !== null ? String(payload.longitude) : null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      emailSource: payload.emailSource ?? (payload.email ? 'manual' : null),
      website: payload.website ?? null,
      facebookUrl: payload.facebookUrl ?? null,
      instagramUrl: payload.instagramUrl ?? null,
      openingHours: payload.openingHours ?? null,
      contactChannel: payload.contactChannel ?? null,
      notes: payload.notes ?? null,
      status: payload.status ?? LocalBusinessStatus.A_CONTACTER,
      hasWebsite: Boolean(payload.website && payload.website.trim().length > 0),
      relancesCount: 0,
      positiveReply: false,
      discoveryCallDone: false,
      salesCallDone: false,
      dealWon: false,
    })

    await ProspectActionService.logAction({
      prospectableType: ProspectableType.LOCAL_BUSINESS_PROSPECT,
      prospectableId: prospect.id,
      actionType: ProspectActionType.CREATED,
      channel: ProspectChannel.EMAIL,
      user,
    })
    return prospect
  }

  /**
   * Cree en masse des business locaux issus d'un import OSM (apres preview).
   * Les doublons OSM sont ignores ; insertion par lots pour limiter la charge DB.
   * @param {CreateLocalBusinessProspectPayload[]} items - Items issus du preview OSM.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<{ inserted: number; skipped: number }>} Statistiques d'import.
   */
  public static async bulkCreateFromOsm(
    items: CreateLocalBusinessProspectPayload[],
    user: User,
  ): Promise<{ inserted: number; skipped: number }> {
    if (items.length === 0) {
      return { inserted: 0, skipped: 0 }
    }

    const existingRows: Pick<LocalBusinessProspect, 'osmType' | 'osmId'>[] = await LocalBusinessProspect.query()
      .where('user_id', user.id)
      .whereNotNull('osm_type')
      .whereNotNull('osm_id')
      .select('osm_type', 'osm_id')

    const existingKeys: Set<string> = new Set(
      existingRows.map(
        (row: Pick<LocalBusinessProspect, 'osmType' | 'osmId'>): string => `${row.osmType}:${row.osmId}`,
      ),
    )

    const seenInPayload: Set<string> = new Set()
    const toInsert: CreateLocalBusinessProspectPayload[] = []
    let skipped: number = 0

    for (const item of items) {
      if (item.osmType && item.osmId) {
        const key: string = `${item.osmType}:${item.osmId}`
        if (existingKeys.has(key) || seenInPayload.has(key)) {
          skipped += 1
          continue
        }
        seenInPayload.add(key)
      }
      toInsert.push({
        ...item,
        emailSource: item.email ? (item.emailSource ?? LocalBusinessEmailSource.OSM) : null,
      })
    }

    let inserted: number = 0
    const BATCH_SIZE: number = 200
    const occurredAt: DateTime = DateTime.now()

    for (let offset: number = 0; offset < toInsert.length; offset += BATCH_SIZE) {
      const chunk: CreateLocalBusinessProspectPayload[] = toInsert.slice(offset, offset + BATCH_SIZE)
      const rows: Partial<ModelAttributes<LocalBusinessProspect>>[] = chunk.map(
        (item: CreateLocalBusinessProspectPayload): Partial<ModelAttributes<LocalBusinessProspect>> =>
          LocalBusinessProspectService.toOsmImportRow(item, user),
      )

      try {
        const created: LocalBusinessProspect[] = await LocalBusinessProspect.createMany(rows)
        inserted += created.length
        await ProspectAction.createMany(
          created.map((prospect: LocalBusinessProspect) => ({
            userId: user.id,
            prospectableType: ProspectableType.LOCAL_BUSINESS_PROSPECT,
            prospectableId: prospect.id,
            actionType: ProspectActionType.IMPORTED_FROM_OSM,
            channel: ProspectChannel.EMAIL,
            content: null,
            occurredAt,
          })),
        )
      } catch {
        skipped += chunk.length
      }
    }

    return { inserted, skipped }
  }

  /**
   * Mappe un payload OSM vers une ligne LocalBusinessProspect (import en masse).
   * @param {CreateLocalBusinessProspectPayload} payload - Donnees validees.
   * @param {User} user - Utilisateur proprietaire.
   * @returns {Partial<ModelAttributes<LocalBusinessProspect>>} Attributs pour createMany.
   */
  private static toOsmImportRow(
    payload: CreateLocalBusinessProspectPayload,
    user: User,
  ): Partial<ModelAttributes<LocalBusinessProspect>> {
    return {
      userId: user.id,
      name: payload.name,
      category: payload.category ?? null,
      subcategory: payload.subcategory ?? null,
      osmType: payload.osmType ?? null,
      osmId: payload.osmId ?? null,
      address: payload.address ?? null,
      city: payload.city ?? null,
      postalCode: payload.postalCode ?? null,
      region: payload.region ?? null,
      country: payload.country ?? 'France',
      latitude: payload.latitude !== undefined && payload.latitude !== null ? String(payload.latitude) : null,
      longitude: payload.longitude !== undefined && payload.longitude !== null ? String(payload.longitude) : null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      emailSource: payload.emailSource ?? (payload.email ? LocalBusinessEmailSource.OSM : null),
      website: payload.website ?? null,
      facebookUrl: payload.facebookUrl ?? null,
      instagramUrl: payload.instagramUrl ?? null,
      openingHours: payload.openingHours ?? null,
      contactChannel: payload.contactChannel ?? null,
      notes: payload.notes ?? null,
      status: payload.status ?? LocalBusinessStatus.A_CONTACTER,
      hasWebsite: Boolean(payload.website && payload.website.trim().length > 0),
      relancesCount: 0,
      positiveReply: false,
      discoveryCallDone: false,
      salesCallDone: false,
      dealWon: false,
    }
  }

  /**
   * Met a jour les champs metiers d'un business local.
   * Si le statut change, une action `status_changed` est ajoutee a la timeline.
   * @param {number} id - Identifiant.
   * @param {UpdateLocalBusinessProspectPayload} payload - Donnees validees.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspect>} Prospect mis a jour.
   */
  public static async updateLocalBusinessProspect(
    id: number,
    payload: UpdateLocalBusinessProspectPayload,
    user: User,
  ): Promise<LocalBusinessProspect> {
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.getLocalBusinessProspect(id, user)
    const previousStatus: LocalBusinessStatus = prospect.status as LocalBusinessStatus

    const {
      nextAction,
      nextActionAt,
      discoveryCallAt,
      salesCallAt,
      proposalSentAt,
      signedAt,
      proposalAmount,
      signedAmount,
      identifiedNeed,
      latitude,
      longitude,
      ...fields
    } = payload

    prospect.merge({
      ...fields,
      latitude: latitude !== undefined ? (latitude !== null ? String(latitude) : null) : prospect.latitude,
      longitude: longitude !== undefined ? (longitude !== null ? String(longitude) : null) : prospect.longitude,
      nextAction: nextAction !== undefined ? nextAction : prospect.nextAction,
      nextActionAt:
        nextActionAt !== undefined ? (nextActionAt ? DateTime.fromISO(nextActionAt) : null) : prospect.nextActionAt,
      discoveryCallAt:
        discoveryCallAt !== undefined
          ? discoveryCallAt
            ? DateTime.fromISO(discoveryCallAt)
            : null
          : prospect.discoveryCallAt,
      salesCallAt:
        salesCallAt !== undefined ? (salesCallAt ? DateTime.fromISO(salesCallAt) : null) : prospect.salesCallAt,
      proposalSentAt:
        proposalSentAt !== undefined
          ? proposalSentAt
            ? DateTime.fromISO(proposalSentAt)
            : null
          : prospect.proposalSentAt,
      signedAt: signedAt !== undefined ? (signedAt ? DateTime.fromISO(signedAt) : null) : prospect.signedAt,
      proposalAmount:
        proposalAmount !== undefined
          ? proposalAmount !== null
            ? String(proposalAmount)
            : null
          : prospect.proposalAmount,
      signedAmount:
        signedAmount !== undefined ? (signedAmount !== null ? String(signedAmount) : null) : prospect.signedAmount,
      identifiedNeed: identifiedNeed !== undefined ? identifiedNeed : prospect.identifiedNeed,
    })

    if (payload.status) {
      LocalBusinessProspectService.applyStatusSideEffects(prospect, payload.status, DateTime.now())
    }
    await prospect.save()

    if (payload.status && payload.status !== previousStatus) {
      await ProspectActionService.logAction({
        prospectableType: ProspectableType.LOCAL_BUSINESS_PROSPECT,
        prospectableId: prospect.id,
        actionType: ProspectActionType.STATUS_CHANGED,
        channel: prospect.contactChannel ? (prospect.contactChannel as ProspectChannel) : ProspectChannel.EMAIL,
        user,
        content: `${previousStatus} -> ${payload.status}`,
      })
    }
    return prospect
  }

  /**
   * Applique une action groupée (favoris, suppression) sur plusieurs business locaux.
   * @param {number[]} ids - Identifiants cibles.
   * @param {import('#enums/prospect_bulk_action').ProspectBulkAction} action - Action a executer.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<{ affected: number }>} Nombre de lignes impactees.
   */
  public static async bulkLocalBusinessProspectAction(
    ids: number[],
    action: ProspectBulkAction,
    user: User,
  ): Promise<{ affected: number }> {
    const uniqueIds: number[] = [...new Set(ids)]
    if (uniqueIds.length === 0) {
      return { affected: 0 }
    }

    const baseQuery: ModelQueryBuilderContract<typeof LocalBusinessProspect, LocalBusinessProspect> =
      LocalBusinessProspect.query().where('user_id', user.id).whereIn('id', uniqueIds)

    if (action === ProspectBulkAction.DELETE) {
      const affected: number | number[] = await baseQuery.delete()
      return { affected: Array.isArray(affected) ? affected.length : Number(affected) }
    }

    const isFavorite: boolean = action === ProspectBulkAction.FAVORITE
    const affected: number | number[] = await baseQuery.update({ isFavorite })
    return { affected: Array.isArray(affected) ? affected.length : Number(affected) }
  }

  /**
   * Supprime un business local de l'utilisateur courant.
   * @param {number} id - Identifiant.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   */
  public static async deleteLocalBusinessProspect(id: number, user: User): Promise<void> {
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.getLocalBusinessProspect(id, user)
    await prospect.delete()
  }

  /**
   * Marque une action rapide (email envoye, appel passe, rdv pris, etc.).
   * @param {number} id - Identifiant.
   * @param {ProspectActionType} actionType - Type d'action.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LocalBusinessProspect>} Prospect synchronise.
   */
  public static async markLocalBusinessProspectAction(
    id: number,
    actionType: ProspectActionType,
    user: User,
  ): Promise<LocalBusinessProspect> {
    const prospect: LocalBusinessProspect = await LocalBusinessProspectService.getLocalBusinessProspect(id, user)
    const now: DateTime = DateTime.now()

    switch (actionType) {
      case ProspectActionType.EMAIL_SENT:
        prospect.firstContactAt = prospect.firstContactAt ?? now
        prospect.contactChannel = 'email'
        prospect.status = LocalBusinessStatus.EMAIL_ENVOYE
        break
      case ProspectActionType.PHONE_CALL:
        prospect.firstContactAt = prospect.firstContactAt ?? now
        prospect.contactChannel = 'phone'
        prospect.status = LocalBusinessStatus.APPEL_PASSE
        break
      case ProspectActionType.RELANCE_1:
        prospect.relance1At = now
        prospect.relancesCount = 1
        prospect.status = LocalBusinessStatus.RELANCE_1_ENVOYEE
        break
      case ProspectActionType.RELANCE_2:
        prospect.relance2At = now
        prospect.relancesCount = 2
        prospect.status = LocalBusinessStatus.RELANCE_2_ENVOYEE
        break
      case ProspectActionType.RELANCE_3:
        prospect.relance3At = now
        prospect.relancesCount = 3
        prospect.status = LocalBusinessStatus.RELANCE_3_ENVOYEE
        break
      case ProspectActionType.REPLY_RECEIVED:
        prospect.repliedAt = now
        prospect.status = LocalBusinessStatus.REPONDU_INTERESSE
        break
      case ProspectActionType.CALL_DISCOVERY:
        prospect.discoveryCallDone = true
        prospect.discoveryCallAt = now
        prospect.status = LocalBusinessStatus.APPEL_DECOUVERTE_FAIT
        break
      case ProspectActionType.CALL_SALES:
        prospect.salesCallDone = true
        prospect.salesCallAt = now
        prospect.status = LocalBusinessStatus.APPEL_DE_VENTE_FAIT
        break
      case ProspectActionType.PROPOSAL_SENT:
        prospect.proposalSentAt = now
        prospect.status = LocalBusinessStatus.PROPOSITION_ENVOYEE
        break
      case ProspectActionType.PROPOSAL_ACCEPTED:
        prospect.dealWon = true
        prospect.signedAt = now
        prospect.status = LocalBusinessStatus.PROPOSITION_ACCEPTEE
        break
      case ProspectActionType.PROPOSAL_REFUSED:
        prospect.status = LocalBusinessStatus.PROPOSITION_REFUSEE
        break
      default:
        break
    }

    await prospect.save()

    await ProspectActionService.logAction({
      prospectableType: ProspectableType.LOCAL_BUSINESS_PROSPECT,
      prospectableId: prospect.id,
      actionType,
      channel: prospect.contactChannel ? (prospect.contactChannel as ProspectChannel) : ProspectChannel.EMAIL,
      user,
      occurredAt: now,
    })
    return prospect
  }

  /**
   * Synchronise des champs derives lors d'un changement de statut.
   * @param {LocalBusinessProspect} prospect - Prospect a mettre a jour.
   * @param {LocalBusinessStatus} status - Statut cible.
   * @param {DateTime} now - Date de reference.
   * @returns {void}
   */
  private static applyStatusSideEffects(
    prospect: LocalBusinessProspect,
    status: LocalBusinessStatus,
    now: DateTime,
  ): void {
    if (status === LocalBusinessStatus.PROPOSITION_ACCEPTEE) {
      prospect.dealWon = true
      prospect.signedAt = prospect.signedAt ?? now
    }
    if (status !== LocalBusinessStatus.PROPOSITION_REFUSEE) {
      prospect.lossReason = null
    }
    if (status === LocalBusinessStatus.APPEL_DECOUVERTE_FAIT) {
      prospect.discoveryCallDone = true
    }
    if (status === LocalBusinessStatus.APPEL_DE_VENTE_FAIT) {
      prospect.salesCallDone = true
    }
  }

  /**
   * Detecte un doublon parmi les business locaux de l'utilisateur.
   * @param {CreateLocalBusinessProspectPayload} payload - Donnees a verifier.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   */
  private static async dedupeLocalBusinessProspect(
    payload: CreateLocalBusinessProspectPayload,
    user: User,
  ): Promise<void> {
    const builder: ModelQueryBuilderContract<typeof LocalBusinessProspect, LocalBusinessProspect> =
      LocalBusinessProspect.query().where('user_id', user.id)

    if (payload.osmType && payload.osmId) {
      const existing: LocalBusinessProspect | null = await builder
        .clone()
        .where('osm_type', payload.osmType)
        .andWhere('osm_id', payload.osmId)
        .first()
      if (existing) {
        throw new LocalBusinessProspectDuplicateException('osm')
      }
    }
    if (payload.email) {
      const existing: LocalBusinessProspect | null = await builder.clone().where('email', payload.email).first()
      if (existing) {
        throw new LocalBusinessProspectDuplicateException('email')
      }
    }
    if (payload.city) {
      const existing: LocalBusinessProspect | null = await builder
        .clone()
        .where('name', payload.name)
        .andWhere('city', payload.city)
        .first()
      if (existing) {
        throw new LocalBusinessProspectDuplicateException('name+city')
      }
    }
  }

  /**
   * Convertit un champ camelCase en snake_case pour la clause ORDER BY.
   * @param {string} field - Nom du champ camelCase.
   * @returns {string} Nom de colonne snake_case.
   */
  private static snakeize(field: string): string {
    return field.replace(/[A-Z]/g, (m: string): string => `_${m.toLowerCase()}`)
  }
}
