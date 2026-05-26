import { DateTime } from 'luxon'
import LinkedinProspect from '#models/linkedin_prospect'
import type ProspectAction from '#models/prospect_action'
import type UserSetting from '#models/user_setting'
import type User from '#models/user'
import type WeeklyObjective from '#models/weekly_objective'
import LinkedinProspectNotFoundException from '#exceptions/linkedin_prospect_not_found_exception'
import LinkedinProspectDuplicateException from '#exceptions/linkedin_prospect_duplicate_exception'
import LinkedinProfileEnrichmentException from '#exceptions/linkedin_profile_enrichment_exception'
import WeeklyInviteLimitReachedException from '#exceptions/weekly_invite_limit_reached_exception'
import LinkedinProfileEnrichmentService from '#services/linkedin_profile_enrichment_service'
import UserSettingsService from '#services/user_settings_service'
import ProspectActionService from '#services/prospect_action_service'
import LinkedinRelanceService from '#services/linkedin_relance_service'
import WeeklyObjectiveService from '#services/weekly_objective_service'
import type { CreateLinkedinProspectPayload } from '#types/payload/linkedin/create_linkedin_prospect_payload'
import type { UpdateLinkedinProspectPayload } from '#types/payload/linkedin/update_linkedin_prospect_payload'
import type { ListLinkedinProspectsQuery } from '#types/payload/linkedin/list_linkedin_prospects_query'
import { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'
import { ProspectActionType } from '#enums/prospect_action_type'
import { ProspectChannel } from '#enums/prospect_channel'
import { ProspectableType } from '#enums/prospectable_type'
import { hasReachedLinkedinStatus } from '#constants/linkedin_status_order'
import { getLinkedinRelancesCount } from '#utils/linkedin_relance_count'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

/**
 * Page de resultats Lucid pour les prospects LinkedIn (alias court).
 */
export type LinkedinProspectPaginator = ModelPaginatorContract<LinkedinProspect>

/**
 * Service metier principal pour les prospects LinkedIn (cahier paragraphes 5, 6, 7).
 *
 * Responsabilites :
 * - CRUD prospects avec deduplication (paragraphe 17.1) ;
 * - Marquage manuel des etapes du workflow (aucun envoi automatique cote serveur, paragraphe 18.1) ;
 * - Synchronisation automatique de l'objectif hebdomadaire.
 */
export default class LinkedinProspectService {
  /**
   * Liste paginee des prospects LinkedIn de l'utilisateur, avec filtres et tri.
   * @param {ListLinkedinProspectsQuery} query - Filtres et pagination valides.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspectPaginator>} Page Lucid.
   */
  public static async listLinkedinProspects(
    query: ListLinkedinProspectsQuery,
    user: User,
  ): Promise<LinkedinProspectPaginator> {
    const page: number = query.page ?? 1
    const perPage: number = query.perPage ?? 25
    const sortBy: string = query.sortBy ?? 'createdAt'
    const sortDir: 'asc' | 'desc' = query.sortDir ?? 'desc'

    const builder: ModelQueryBuilderContract<typeof LinkedinProspect, LinkedinProspect> =
      LinkedinProspect.query().where('user_id', user.id)

    if (query.search) {
      const term: string = `%${query.search}%`
      builder.where((sub: ModelQueryBuilderContract<typeof LinkedinProspect, LinkedinProspect>): void => {
        sub
          .whereILike('first_name', term)
          .orWhereILike('last_name', term)
          .orWhereILike('company', term)
          .orWhereILike('position', term)
      })
    }
    if (query.status && query.status.length > 0) {
      builder.whereIn('status', query.status as string[])
    }
    if (query.industry) {
      builder.where('industry', query.industry)
    }
    if (query.city) {
      builder.where('city', query.city)
    }
    if (query.region) {
      builder.where('region', query.region)
    }
    if (query.position) {
      builder.whereILike('position', `%${query.position}%`)
    }
    if (query.company) {
      builder.whereILike('company', `%${query.company}%`)
    }
    if (query.invitationSent !== undefined) {
      if (query.invitationSent) {
        builder.whereNotNull('invitation_sent_at')
      } else {
        builder.whereNull('invitation_sent_at')
      }
    }
    if (query.invitationAccepted !== undefined) {
      if (query.invitationAccepted) {
        builder.whereNotNull('invitation_accepted_at')
      } else {
        builder.whereNull('invitation_accepted_at')
      }
    }
    if (query.replied !== undefined) {
      if (query.replied) {
        builder.whereNotNull('replied_at')
      } else {
        builder.whereNull('replied_at')
      }
    }
    if (query.hasEmail !== undefined) {
      if (query.hasEmail) {
        builder.whereNotNull('email')
      } else {
        builder.whereNull('email')
      }
    }
    if (query.week) {
      builder.where('added_at_week', query.week)
    }

    builder.orderBy(LinkedinProspectService.snakeize(sortBy), sortDir)
    return await builder.paginate(page, perPage)
  }

  /**
   * Liste les prospects LinkedIn de la semaine demandee (cahier paragraphe 5).
   * Par defaut on retourne la semaine ISO courante, sans pagination.
   * @param {string | undefined} week - Semaine ISO YYYY-Www (default: courante).
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect[]>} Liste des prospects de la semaine.
   */
  public static async listWeeklyLinkedinProspects(week: string | undefined, user: User): Promise<LinkedinProspect[]> {
    const targetWeek: string = week ?? WeeklyObjectiveService.getCurrentIsoWeek()
    return await LinkedinProspect.query()
      .where('user_id', user.id)
      .andWhere('added_at_week', targetWeek)
      .orderBy('created_at', 'desc')
  }

  /**
   * Charge un prospect LinkedIn avec sa timeline d'actions.
   * @param {number} id - Identifiant du prospect.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect>} Prospect charge.
   * @throws {LinkedinProspectNotFoundException} Si le prospect n'existe pas pour cet utilisateur.
   */
  public static async getLinkedinProspect(id: number, user: User): Promise<LinkedinProspect> {
    const prospect: LinkedinProspect | null = await LinkedinProspect.query()
      .where('user_id', user.id)
      .andWhere('id', id)
      .preload('actions', (q: ModelQueryBuilderContract<typeof ProspectAction, ProspectAction>): void => {
        q.orderBy('occurred_at', 'desc')
      })
      .first()
    if (!prospect) {
      throw new LinkedinProspectNotFoundException()
    }
    return prospect
  }

  /**
   * Cree un prospect LinkedIn apres deduplication.
   * @param {CreateLinkedinProspectPayload} payload - Donnees validees.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect>} Prospect cree.
   * @throws {LinkedinProspectDuplicateException} Si un prospect identique existe deja.
   */
  public static async createLinkedinProspect(
    payload: CreateLinkedinProspectPayload,
    user: User,
  ): Promise<LinkedinProspect> {
    await LinkedinProspectService.dedupeLinkedinProspect(payload, user)

    const prospect: LinkedinProspect = await LinkedinProspect.create({
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      position: payload.position ?? null,
      company: payload.company ?? null,
      industry: payload.industry ?? null,
      city: payload.city ?? null,
      region: payload.region ?? null,
      country: payload.country ?? null,
      profileHeadline: payload.profileHeadline ?? null,
      openToWork: payload.openToWork ?? null,
      hiring: payload.hiring ?? null,
      connectionsCount: payload.connectionsCount ?? null,
      followerCount: payload.followerCount ?? null,
      linkedinUrl: payload.linkedinUrl ?? null,
      companyLinkedinUrl: payload.companyLinkedinUrl ?? null,
      websiteUrl: payload.websiteUrl ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      companyEmployeeCountRange: payload.companyEmployeeCountRange ?? null,
      companyType: payload.companyType ?? null,
      companyTagline: payload.companyTagline ?? null,
      companyDescription: payload.companyDescription ?? null,
      status: payload.status ?? LinkedinProspectStatus.A_INVITER,
      relancesCount: 0,
      positiveReply: false,
      discoveryCallDone: false,
      salesCallDone: false,
      dealWon: false,
    })
    LinkedinProspectService.applyStatusMilestones(prospect, prospect.status as LinkedinProspectStatus, DateTime.now())
    if (LinkedinRelanceService.isInRelanceFunnel(prospect)) {
      await LinkedinRelanceService.syncProspectRelanceFields(prospect, user)
    }
    await prospect.save()

    await ProspectActionService.logAction({
      prospectableType: ProspectableType.LINKEDIN_PROSPECT,
      prospectableId: prospect.id,
      actionType: ProspectActionType.CREATED,
      channel: ProspectChannel.LINKEDIN,
      user,
    })
    return prospect
  }

  /**
   * Met a jour les champs metiers d'un prospect.
   * Si le statut change, une action `status_changed` est ajoutee a la timeline.
   * @param {number} id - Identifiant du prospect.
   * @param {UpdateLinkedinProspectPayload} payload - Donnees validees.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect>} Prospect mis a jour.
   */
  public static async updateLinkedinProspect(
    id: number,
    payload: UpdateLinkedinProspectPayload,
    user: User,
  ): Promise<LinkedinProspect> {
    const prospect: LinkedinProspect = await LinkedinProspectService.getLinkedinProspect(id, user)
    const previousStatus: LinkedinProspectStatus = prospect.status as LinkedinProspectStatus
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
      ...fields
    } = payload

    prospect.merge({
      ...fields,
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
      LinkedinProspectService.applyStatusMilestones(prospect, payload.status, DateTime.now())
    }

    const hasCommercialPayload: boolean =
      proposalAmount !== undefined ||
      signedAmount !== undefined ||
      discoveryCallAt !== undefined ||
      salesCallAt !== undefined ||
      proposalSentAt !== undefined ||
      signedAt !== undefined ||
      identifiedNeed !== undefined

    if (payload.status || hasCommercialPayload) {
      LinkedinProspectService.reapplyExplicitCommercialFields(prospect, {
        discoveryCallAt,
        salesCallAt,
        proposalSentAt,
        signedAt,
        proposalAmount,
        signedAmount,
        identifiedNeed,
      })
      LinkedinProspectService.syncCommercialMilestoneDates(prospect, DateTime.now())
    }

    if (payload.status) {
      if (nextAction !== undefined) {
        prospect.nextAction = nextAction
      }
      if (nextActionAt !== undefined) {
        prospect.nextActionAt = nextActionAt ? DateTime.fromISO(nextActionAt) : null
      }
      if (LinkedinRelanceService.isInRelanceFunnel(prospect)) {
        await LinkedinRelanceService.syncProspectRelanceFields(prospect, user)
      }
    }
    await prospect.save()

    if (payload.status && payload.status !== previousStatus) {
      await ProspectActionService.logAction({
        prospectableType: ProspectableType.LINKEDIN_PROSPECT,
        prospectableId: prospect.id,
        actionType: ProspectActionType.STATUS_CHANGED,
        channel: ProspectChannel.LINKEDIN,
        user,
        content: `${previousStatus} -> ${payload.status}`,
      })
    }
    return prospect
  }

  /**
   * Rafraichit les donnees enrichies d'un prospect depuis son URL LinkedIn.
   * Les champs de suivi commercial restent inchanges.
   * @param {number} id - Identifiant du prospect.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect>} Prospect mis a jour.
   */
  public static async refreshLinkedinProspect(id: number, user: User): Promise<LinkedinProspect> {
    const prospect: LinkedinProspect = await LinkedinProspectService.getLinkedinProspect(id, user)
    if (!prospect.linkedinUrl) {
      throw new LinkedinProfileEnrichmentException("Ce prospect n'a pas d'URL LinkedIn a rafraichir", 422)
    }

    const enrichment: Partial<CreateLinkedinProspectPayload> = await LinkedinProfileEnrichmentService.enrich(
      prospect.linkedinUrl,
    )
    return await LinkedinProspectService.updateLinkedinProspect(id, enrichment, user)
  }

  /**
   * Supprime un prospect LinkedIn de l'utilisateur courant.
   * @param {number} id - Identifiant du prospect.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   */
  public static async deleteLinkedinProspect(id: number, user: User): Promise<void> {
    const prospect: LinkedinProspect = await LinkedinProspectService.getLinkedinProspect(id, user)
    await prospect.delete()
  }

  /**
   * Marque une action LinkedIn (invitation envoyee, acceptee, relance, reponse, etc.)
   * et synchronise l'objectif hebdomadaire si necessaire. Aucun envoi reel n'est effectue.
   * @param {number} id - Identifiant du prospect.
   * @param {ProspectActionType} actionType - Type d'action a journaliser.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<LinkedinProspect>} Prospect mis a jour.
   */
  public static async markLinkedinProspectAction(
    id: number,
    actionType: ProspectActionType,
    user: User,
  ): Promise<LinkedinProspect> {
    const prospect: LinkedinProspect = await LinkedinProspectService.getLinkedinProspect(id, user)
    const now: DateTime = DateTime.now()

    switch (actionType) {
      case ProspectActionType.INVITATION_SENT:
        await LinkedinProspectService.assertWeeklyInviteLimit(user)
        prospect.invitationSentAt = now
        prospect.status = LinkedinProspectStatus.INVITATION_ENVOYEE
        break
      case ProspectActionType.INVITATION_ACCEPTED:
        prospect.invitationAcceptedAt = now
        prospect.status = LinkedinProspectStatus.INVITATION_ACCEPTEE
        break
      case ProspectActionType.MESSAGE_SENT:
        prospect.message1SentAt = now
        prospect.status = LinkedinProspectStatus.MESSAGE_1_ENVOYE
        break
      case ProspectActionType.RELANCE_1:
        prospect.relance1At = now
        prospect.relancesCount = 1
        prospect.status = LinkedinProspectStatus.MESSAGE_1_ENVOYE
        break
      case ProspectActionType.RELANCE_2:
        prospect.relance2At = now
        prospect.relancesCount = 2
        prospect.status = LinkedinProspectStatus.MESSAGE_1_ENVOYE
        break
      case ProspectActionType.RELANCE_3:
        prospect.relance3At = now
        prospect.relancesCount = 3
        prospect.status = LinkedinProspectStatus.MESSAGE_1_ENVOYE
        break
      case ProspectActionType.REPLY_RECEIVED:
        prospect.repliedAt = now
        prospect.status = LinkedinProspectStatus.REPONDU_A_QUALIFIER
        break
      case ProspectActionType.CALL_DISCOVERY:
        prospect.discoveryCallDone = true
        prospect.discoveryCallAt = now
        prospect.status = LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT
        break
      case ProspectActionType.CALL_SALES:
        prospect.salesCallDone = true
        prospect.salesCallAt = now
        prospect.status = LinkedinProspectStatus.APPEL_DE_VENTE_FAIT
        break
      case ProspectActionType.PROPOSAL_SENT:
        prospect.proposalSentAt = now
        prospect.status = LinkedinProspectStatus.PROPOSITION_ENVOYEE
        break
      case ProspectActionType.PROPOSAL_ACCEPTED:
        prospect.dealWon = true
        prospect.signedAt = now
        prospect.status = LinkedinProspectStatus.PROPOSITION_ACCEPTEE
        break
      case ProspectActionType.PROPOSAL_REFUSED:
        prospect.status = LinkedinProspectStatus.PROPOSITION_REFUSEE
        break
      default:
        // Note ou status_changed: pas de mutation sur le prospect.
        break
    }

    LinkedinProspectService.applyStatusMilestones(prospect, prospect.status as LinkedinProspectStatus, now)
    if (LinkedinRelanceService.isInRelanceFunnel(prospect)) {
      await LinkedinRelanceService.syncProspectRelanceFields(prospect, user)
    }
    await prospect.save()

    await ProspectActionService.logAction({
      prospectableType: ProspectableType.LINKEDIN_PROSPECT,
      prospectableId: prospect.id,
      actionType,
      channel: ProspectChannel.LINKEDIN,
      user,
      occurredAt: now,
    })

    if (actionType === ProspectActionType.INVITATION_SENT) {
      await WeeklyObjectiveService.incrementInvitesSent(user)
    }
    return prospect
  }

  /**
   * Verifie qu'on n'a pas atteint la limite hebdomadaire d'invitations
   * (cahier paragraphes 5.2 section 1 et 18.1).
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   * @throws {WeeklyInviteLimitReachedException} Si la limite est atteinte.
   */
  private static async assertWeeklyInviteLimit(user: User): Promise<void> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(user)
    const objective: WeeklyObjective = await WeeklyObjectiveService.getCurrentWeeklyObjective(user)
    if (objective.invitesSent >= settings.maxInvitesPerWeek) {
      throw new WeeklyInviteLimitReachedException(settings.maxInvitesPerWeek)
    }
  }

  /**
   * Synchronise les champs de jalons avec le statut courant.
   * @param {LinkedinProspect} prospect - Prospect a synchroniser.
   * @param {LinkedinProspectStatus} status - Statut courant.
   * @param {DateTime} now - Date de reference.
   * @returns {void}
   */
  private static applyStatusMilestones(
    prospect: LinkedinProspect,
    status: LinkedinProspectStatus,
    now: DateTime,
  ): void {
    prospect.nextAction = LinkedinProspectService.getDefaultNextAction(status)
    prospect.nextActionAt = null

    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.INVITATION_ENVOYEE)) {
      prospect.invitationSentAt = prospect.invitationSentAt ?? now
    } else {
      prospect.invitationSentAt = null
    }
    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.INVITATION_ACCEPTEE)) {
      prospect.invitationAcceptedAt = prospect.invitationAcceptedAt ?? now
    } else {
      prospect.invitationAcceptedAt = null
    }
    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.MESSAGE_1_ENVOYE)) {
      prospect.message1SentAt = prospect.message1SentAt ?? now
    } else {
      prospect.message1SentAt = null
    }
    if (!hasReachedLinkedinStatus(status, LinkedinProspectStatus.MESSAGE_1_ENVOYE)) {
      prospect.relance1At = null
      prospect.relance2At = null
      prospect.relance3At = null
      prospect.relancesCount = 0
    } else {
      if (LinkedinProspectService.shouldBackfillRelance(status, 1)) {
        prospect.relance1At = prospect.relance1At ?? now
      }
      if (LinkedinProspectService.shouldBackfillRelance(status, 2)) {
        prospect.relance2At = prospect.relance2At ?? now
      }
      if (LinkedinProspectService.shouldBackfillRelance(status, 3)) {
        prospect.relance3At = prospect.relance3At ?? now
      }
      prospect.relancesCount = getLinkedinRelancesCount(prospect)
    }

    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.REPONDU_A_QUALIFIER)) {
      prospect.repliedAt = prospect.repliedAt ?? now
    } else {
      prospect.repliedAt = null
    }
    prospect.positiveReply = hasReachedLinkedinStatus(status, LinkedinProspectStatus.REPONDU_INTERESSE)

    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT)) {
      prospect.discoveryCallDone = true
    } else {
      prospect.discoveryCallAt = null
      prospect.discoveryCallDone = false
    }
    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.APPEL_DE_VENTE_FAIT)) {
      prospect.salesCallDone = true
    } else {
      prospect.salesCallAt = null
      prospect.salesCallDone = false
    }
    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.PROPOSITION_ENVOYEE)) {
      prospect.proposalSentAt = prospect.proposalSentAt ?? now
    } else {
      prospect.proposalSentAt = null
    }
    if (hasReachedLinkedinStatus(status, LinkedinProspectStatus.PROPOSITION_ACCEPTEE)) {
      prospect.dealWon = true
      prospect.signedAt = prospect.signedAt ?? now
    } else {
      prospect.dealWon = false
      prospect.signedAt = null
    }
    if (status !== LinkedinProspectStatus.PROPOSITION_REFUSEE) {
      prospect.lossReason = null
    }
  }

  /**
   * Reapplique les champs commerciaux saisis explicitement apres la synchro des jalons statut.
   * Permet de planifier un appel ou renseigner un montant avant le statut correspondant.
   * @param {LinkedinProspect} prospect - Prospect a mettre a jour.
   * @param {object} payload - Champs commerciaux explicitement fournis.
   * @returns {void}
   */
  private static reapplyExplicitCommercialFields(
    prospect: LinkedinProspect,
    payload: {
      discoveryCallAt?: string | null
      salesCallAt?: string | null
      proposalSentAt?: string | null
      signedAt?: string | null
      proposalAmount?: number | null
      signedAmount?: number | null
      identifiedNeed?: string | null
    },
  ): void {
    if (payload.discoveryCallAt !== undefined) {
      prospect.discoveryCallAt = payload.discoveryCallAt ? DateTime.fromISO(payload.discoveryCallAt) : null
    }
    if (payload.salesCallAt !== undefined) {
      prospect.salesCallAt = payload.salesCallAt ? DateTime.fromISO(payload.salesCallAt) : null
    }
    if (payload.proposalSentAt !== undefined) {
      prospect.proposalSentAt = payload.proposalSentAt ? DateTime.fromISO(payload.proposalSentAt) : null
    }
    if (payload.signedAt !== undefined) {
      prospect.signedAt = payload.signedAt ? DateTime.fromISO(payload.signedAt) : null
    }
    if (payload.proposalAmount !== undefined) {
      prospect.proposalAmount = payload.proposalAmount !== null ? String(payload.proposalAmount) : null
    }
    if (payload.signedAmount !== undefined) {
      prospect.signedAmount = payload.signedAmount !== null ? String(payload.signedAmount) : null
    }
    if (payload.identifiedNeed !== undefined) {
      prospect.identifiedNeed = payload.identifiedNeed
    }
  }

  /**
   * Aligne les jalons commerciaux quand des montants sont renseignes manuellement.
   * @param {LinkedinProspect} prospect - Prospect a synchroniser.
   * @param {DateTime} now - Date de reference.
   * @returns {void}
   */
  private static syncCommercialMilestoneDates(prospect: LinkedinProspect, now: DateTime): void {
    const status: LinkedinProspectStatus = prospect.status as LinkedinProspectStatus
    const proposalValue: number = LinkedinProspectService.readAmount(prospect.proposalAmount)
    const signedValue: number = LinkedinProspectService.readAmount(prospect.signedAmount)

    if (proposalValue > 0 && hasReachedLinkedinStatus(status, LinkedinProspectStatus.PROPOSITION_ENVOYEE)) {
      prospect.proposalSentAt = prospect.proposalSentAt ?? now
    }

    if (signedValue > 0 && hasReachedLinkedinStatus(status, LinkedinProspectStatus.PROPOSITION_ACCEPTEE)) {
      prospect.dealWon = true
      prospect.signedAt = prospect.signedAt ?? now
    }
  }

  /**
   * Convertit un montant stocke en nombre exploitable.
   * @param {string | null} value - Montant en base.
   * @returns {number} Montant numerique ou 0.
   */
  private static readAmount(value: string | null): number {
    if (value === null) {
      return 0
    }

    const parsed: number = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  /**
   * Retourne la prochaine action metier attendue pour un statut.
   * @param {LinkedinProspectStatus} status - Statut courant.
   * @returns {string} Libelle de prochaine action.
   */
  private static getDefaultNextAction(status: LinkedinProspectStatus): string {
    const labels: Record<LinkedinProspectStatus, string> = {
      [LinkedinProspectStatus.A_INVITER]: 'Envoyer invitation LinkedIn',
      [LinkedinProspectStatus.INVITATION_ENVOYEE]: "Attendre l'acceptation",
      [LinkedinProspectStatus.INVITATION_ACCEPTEE]: 'Envoyer message 1',
      [LinkedinProspectStatus.MESSAGE_1_ENVOYE]: 'Envoyer relance 1',
      [LinkedinProspectStatus.RELANCE_1_ENVOYEE]: 'Envoyer relance 2',
      [LinkedinProspectStatus.RELANCE_2_ENVOYEE]: 'Envoyer relance 3',
      [LinkedinProspectStatus.RELANCE_3_ENVOYEE]: 'Qualifier la reponse LinkedIn',
      [LinkedinProspectStatus.NON_REPONDU_LINKEDIN]: 'Aucune action suivante (relances terminees)',
      [LinkedinProspectStatus.REPONDU_A_QUALIFIER]: 'Qualifier la reponse',
      [LinkedinProspectStatus.REPONDU_INTERESSE]: 'Faire appel decouverte',
      [LinkedinProspectStatus.REPONDU_NON_INTERESSE]: 'Aucune action suivante',
      [LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT]: 'Faire appel de vente',
      [LinkedinProspectStatus.APPEL_DE_VENTE_FAIT]: 'Envoyer proposition',
      [LinkedinProspectStatus.PROPOSITION_ENVOYEE]: "Enregistrer l'acceptation ou le refus",
      [LinkedinProspectStatus.PROPOSITION_ACCEPTEE]: 'Aucune action suivante',
      [LinkedinProspectStatus.PROPOSITION_REFUSEE]: 'Aucune action suivante',
      [LinkedinProspectStatus.ARCHIVE]: 'Aucune action suivante',
    }

    return labels[status]
  }

  /**
   * Indique si un statut doit creer automatiquement une date de relance.
   * @param {LinkedinProspectStatus} status - Statut courant.
   * @param {number} relance - Numero de relance.
   * @returns {boolean} True si la relance doit etre renseignee.
   */
  private static shouldBackfillRelance(status: LinkedinProspectStatus, relance: number): boolean {
    const relanceStatusMap: Record<number, LinkedinProspectStatus[]> = {
      1: [
        LinkedinProspectStatus.RELANCE_1_ENVOYEE,
        LinkedinProspectStatus.RELANCE_2_ENVOYEE,
        LinkedinProspectStatus.RELANCE_3_ENVOYEE,
        LinkedinProspectStatus.NON_REPONDU_LINKEDIN,
      ],
      2: [
        LinkedinProspectStatus.RELANCE_2_ENVOYEE,
        LinkedinProspectStatus.RELANCE_3_ENVOYEE,
        LinkedinProspectStatus.NON_REPONDU_LINKEDIN,
      ],
      3: [LinkedinProspectStatus.RELANCE_3_ENVOYEE, LinkedinProspectStatus.NON_REPONDU_LINKEDIN],
    }

    return relanceStatusMap[relance].includes(status)
  }

  /**
   * Detecte un doublon parmi les prospects LinkedIn de l'utilisateur (cahier paragraphe 17.1).
   * @param {CreateLinkedinProspectPayload} payload - Donnees a verifier.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   * @throws {LinkedinProspectDuplicateException} Si un critere de doublon matche.
   */
  private static async dedupeLinkedinProspect(payload: CreateLinkedinProspectPayload, user: User): Promise<void> {
    const builder: ModelQueryBuilderContract<typeof LinkedinProspect, LinkedinProspect> =
      LinkedinProspect.query().where('user_id', user.id)
    if (payload.linkedinUrl) {
      const existing: LinkedinProspect | null = await builder.clone().where('linkedin_url', payload.linkedinUrl).first()
      if (existing) {
        throw new LinkedinProspectDuplicateException('linkedin_url')
      }
    }
    if (payload.email) {
      const existing: LinkedinProspect | null = await builder.clone().where('email', payload.email).first()
      if (existing) {
        throw new LinkedinProspectDuplicateException('email')
      }
    }
    if (payload.company) {
      const existing: LinkedinProspect | null = await builder
        .clone()
        .where('first_name', payload.firstName)
        .andWhere('last_name', payload.lastName)
        .andWhere('company', payload.company)
        .first()
      if (existing) {
        throw new LinkedinProspectDuplicateException('name+company')
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
