import { DateTime } from 'luxon'
import LinkedinProspect from '#models/linkedin_prospect'
import ProspectAction from '#models/prospect_action'
import type User from '#models/user'
import { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'
import { ProspectActionType } from '#enums/prospect_action_type'
import type { LinkedinStatsQuery } from '#types/payload/stats/linkedin_stats_query'
import type { LinkedinStatsResponse } from '#types/response/stats/linkedin_stats_response'
import { hasReachedLinkedinStatus } from '#constants/linkedin_status_order'

/**
 * Bornes temporelles normalisees pour filtrer les statistiques LinkedIn.
 */
type StatsDateRange = {
  from: DateTime
  to: DateTime
}

/**
 * Service metier pour les statistiques (cahier paragraphes 13.2 a 13.4).
 */
export default class LinkedinStatsService {
  private static readonly parisZone: string = 'Europe/Paris'

  /**
   * Calcule toutes les statistiques LinkedIn de l'utilisateur.
   * Les taux sont retournes au format pourcentage (0 - 100).
   * @param {User} user - Utilisateur authentifie.
   * @param {LinkedinStatsQuery} [query] - Filtre de periode optionnel.
   * @returns {Promise<LinkedinStatsResponse>} Statistiques pretes a afficher.
   */
  public static async getLinkedinStats(user: User, query: LinkedinStatsQuery = {}): Promise<LinkedinStatsResponse> {
    const all: LinkedinProspect[] = await LinkedinProspect.query().where('user_id', user.id)
    const range: StatsDateRange | null = LinkedinStatsService.resolveDateRange(query)

    if (!range) {
      return LinkedinStatsService.buildCumulativeStats(all)
    }

    return await LinkedinStatsService.buildRangeStats(all, user, range)
  }

  /**
   * Construit les statistiques cumulees depuis le statut courant des prospects.
   * @param {LinkedinProspect[]} all - Prospects de l'utilisateur.
   * @returns {LinkedinStatsResponse} Statistiques cumulees.
   */
  private static buildCumulativeStats(all: LinkedinProspect[]): LinkedinStatsResponse {
    const invitationsSent: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.INVITATION_ENVOYEE),
    ).length
    const invitationsAccepted: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.INVITATION_ACCEPTEE),
    ).length
    const messagesSent: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.MESSAGE_1_ENVOYE),
    ).length
    const replies: number = all.filter(
      (p: LinkedinProspect): boolean =>
        hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.REPONDU_A_QUALIFIER) ||
        p.status === LinkedinProspectStatus.REPONDU_NON_INTERESSE,
    ).length
    const positiveReplies: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.REPONDU_INTERESSE),
    ).length
    const negativeReplies: number = all.filter(
      (p: LinkedinProspect): boolean => p.status === LinkedinProspectStatus.REPONDU_NON_INTERESSE,
    ).length
    const discoveryCallsScheduled: number = all.filter(
      (p: LinkedinProspect): boolean =>
        Boolean(p.discoveryCallAt) ||
        hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT),
    ).length
    const discoveryCallsDone: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT),
    ).length
    const salesCallsScheduled: number = all.filter(
      (p: LinkedinProspect): boolean =>
        Boolean(p.salesCallAt) ||
        hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.APPEL_DE_VENTE_FAIT),
    ).length
    const proposalsSent: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.PROPOSITION_ENVOYEE),
    ).length
    const salesCallsDone: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.APPEL_DE_VENTE_FAIT),
    ).length
    const proposalsAccepted: number = all.filter((p: LinkedinProspect): boolean =>
      hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.PROPOSITION_ACCEPTEE),
    ).length
    const proposalsRefused: number = all.filter(
      (p: LinkedinProspect): boolean => p.status === LinkedinProspectStatus.PROPOSITION_REFUSEE,
    ).length
    const totalProposalAmount: number = LinkedinStatsService.sumProposalAmounts(all)
    const totalSignedAmount: number = LinkedinStatsService.sumSignedAmounts(all)

    return LinkedinStatsService.buildResponse({
      invitationsSent,
      invitationsAccepted,
      messagesSent,
      replies,
      positiveReplies,
      negativeReplies,
      discoveryCallsScheduled,
      discoveryCallsDone,
      salesCallsScheduled,
      salesCallsDone,
      proposalsSent,
      proposalsAccepted,
      proposalsRefused,
      totalProposalAmount,
      totalSignedAmount,
    })
  }

  /**
   * Construit les statistiques limitees a une periode via les dates de jalons.
   * @param {LinkedinProspect[]} all - Prospects de l'utilisateur.
   * @param {User} user - Utilisateur authentifie.
   * @param {StatsDateRange} range - Periode a appliquer.
   * @returns {Promise<LinkedinStatsResponse>} Statistiques filtrees.
   */
  private static async buildRangeStats(
    all: LinkedinProspect[],
    user: User,
    range: StatsDateRange,
  ): Promise<LinkedinStatsResponse> {
    const invitationsSent: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.invitationSentAt, range),
    ).length
    const invitationsAccepted: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.invitationAcceptedAt, range),
    ).length
    const messagesSent: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.message1SentAt, range),
    ).length
    const replies: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.repliedAt, range),
    ).length
    const positiveReplies: number = all.filter(
      (p: LinkedinProspect): boolean =>
        LinkedinStatsService.isInRange(p.repliedAt, range) &&
        (Boolean(p.positiveReply) ||
          hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.REPONDU_INTERESSE)),
    ).length
    const negativeReplies: number = all.filter(
      (p: LinkedinProspect): boolean =>
        LinkedinStatsService.isInRange(p.repliedAt, range) && p.status === LinkedinProspectStatus.REPONDU_NON_INTERESSE,
    ).length
    const discoveryCallsScheduled: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.discoveryCallAt, range),
    ).length
    const discoveryCallsDone: number = all.filter(
      (p: LinkedinProspect): boolean => p.discoveryCallDone && LinkedinStatsService.isInRange(p.discoveryCallAt, range),
    ).length
    const salesCallsScheduled: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.salesCallAt, range),
    ).length
    const salesCallsDone: number = all.filter(
      (p: LinkedinProspect): boolean => p.salesCallDone && LinkedinStatsService.isInRange(p.salesCallAt, range),
    ).length
    const proposalsSent: number = all.filter((p: LinkedinProspect): boolean =>
      LinkedinStatsService.isInRange(p.proposalSentAt, range),
    ).length
    const proposalsAccepted: number = all.filter(
      (p: LinkedinProspect): boolean =>
        hasReachedLinkedinStatus(p.status as LinkedinProspectStatus, LinkedinProspectStatus.PROPOSITION_ACCEPTEE) &&
        LinkedinStatsService.isInRange(LinkedinStatsService.resolveSignedAmountDate(p), range),
    ).length
    const proposalsRefused: number = await LinkedinStatsService.countProposalRefusedInRange(user, range)
    const totalProposalAmount: number = LinkedinStatsService.sumProposalAmounts(all, range)
    const totalSignedAmount: number = LinkedinStatsService.sumSignedAmounts(all, range)

    return LinkedinStatsService.buildResponse({
      invitationsSent,
      invitationsAccepted,
      messagesSent,
      replies,
      positiveReplies,
      negativeReplies,
      discoveryCallsScheduled,
      discoveryCallsDone,
      salesCallsScheduled,
      salesCallsDone,
      proposalsSent,
      proposalsAccepted,
      proposalsRefused,
      totalProposalAmount,
      totalSignedAmount,
    })
  }

  /**
   * Assemble la reponse finale avec les taux calcules.
   * @param {object} counts - Compteurs bruts.
   * @returns {LinkedinStatsResponse} Statistiques completes.
   */
  private static buildResponse(counts: {
    invitationsSent: number
    invitationsAccepted: number
    messagesSent: number
    replies: number
    positiveReplies: number
    negativeReplies: number
    discoveryCallsScheduled: number
    discoveryCallsDone: number
    salesCallsScheduled: number
    salesCallsDone: number
    proposalsSent: number
    proposalsAccepted: number
    proposalsRefused: number
    totalProposalAmount: number
    totalSignedAmount: number
  }): LinkedinStatsResponse {
    return {
      invitationsSent: counts.invitationsSent,
      invitationsAccepted: counts.invitationsAccepted,
      acceptanceRate: LinkedinStatsService.rate(counts.invitationsAccepted, counts.invitationsSent),
      messagesSent: counts.messagesSent,
      replies: counts.replies,
      replyRate: LinkedinStatsService.rate(counts.replies, counts.messagesSent),
      positiveReplies: counts.positiveReplies,
      negativeReplies: counts.negativeReplies,
      positiveReplyRate: LinkedinStatsService.rate(counts.positiveReplies, counts.replies),
      discoveryCallsScheduled: counts.discoveryCallsScheduled,
      discoveryCallsDone: counts.discoveryCallsDone,
      salesCallsScheduled: counts.salesCallsScheduled,
      salesCallsDone: counts.salesCallsDone,
      appointmentRate: LinkedinStatsService.rate(counts.discoveryCallsDone, counts.positiveReplies),
      proposalsSent: counts.proposalsSent,
      proposalsAccepted: counts.proposalsAccepted,
      proposalsRefused: counts.proposalsRefused,
      closingRate: LinkedinStatsService.rate(counts.proposalsAccepted, counts.proposalsSent),
      totalProposalAmount: counts.totalProposalAmount,
      totalSignedAmount: counts.totalSignedAmount,
    }
  }

  /**
   * Compte les propositions refusees journalisees dans la periode.
   * @param {User} user - Utilisateur authentifie.
   * @param {StatsDateRange} range - Periode a appliquer.
   * @returns {Promise<number>} Nombre de refus.
   */
  private static async countProposalRefusedInRange(user: User, range: StatsDateRange): Promise<number> {
    const refusedActions: ProspectAction[] = await ProspectAction.query()
      .where('user_id', user.id)
      .where('action_type', ProspectActionType.PROPOSAL_REFUSED)
      .whereBetween('occurred_at', [range.from.toSQL()!, range.to.toSQL()!])

    return refusedActions.length
  }

  /**
   * Resout les bornes de periode depuis la query string.
   * @param {LinkedinStatsQuery} query - Query validee.
   * @returns {StatsDateRange | null} Periode normalisee ou null si aucun filtre.
   */
  private static resolveDateRange(query: LinkedinStatsQuery): StatsDateRange | null {
    if (!query.from && !query.to) {
      return null
    }

    const from: DateTime = query.from
      ? DateTime.fromISO(query.from, { zone: LinkedinStatsService.parisZone }).startOf('day')
      : DateTime.fromMillis(0, { zone: LinkedinStatsService.parisZone })

    const to: DateTime = query.to
      ? DateTime.fromISO(query.to, { zone: LinkedinStatsService.parisZone }).endOf('day')
      : DateTime.now().setZone(LinkedinStatsService.parisZone).endOf('day')

    return { from, to }
  }

  /**
   * Somme les montants de propositions envoyees.
   * @param {LinkedinProspect[]} prospects - Prospects a evaluer.
   * @param {StatsDateRange | null} [range] - Periode optionnelle.
   * @returns {number} Total CA propose.
   */
  private static sumProposalAmounts(prospects: LinkedinProspect[], range: StatsDateRange | null = null): number {
    return prospects
      .filter((prospect: LinkedinProspect): boolean => LinkedinStatsService.isEligibleForProposalAmount(prospect))
      .filter((prospect: LinkedinProspect): boolean =>
        range ? LinkedinStatsService.isInRange(LinkedinStatsService.resolveProposalAmountDate(prospect), range) : true,
      )
      .reduce(
        (sum: number, prospect: LinkedinProspect): number =>
          sum + LinkedinStatsService.readAmount(prospect.proposalAmount),
        0,
      )
  }

  /**
   * Somme les montants signes.
   * @param {LinkedinProspect[]} prospects - Prospects a evaluer.
   * @param {StatsDateRange | null} [range] - Periode optionnelle.
   * @returns {number} Total CA signe.
   */
  private static sumSignedAmounts(prospects: LinkedinProspect[], range: StatsDateRange | null = null): number {
    return prospects
      .filter((prospect: LinkedinProspect): boolean => LinkedinStatsService.isEligibleForSignedAmount(prospect))
      .filter((prospect: LinkedinProspect): boolean =>
        range ? LinkedinStatsService.isInRange(LinkedinStatsService.resolveSignedAmountDate(prospect), range) : true,
      )
      .reduce(
        (sum: number, prospect: LinkedinProspect): number =>
          sum + LinkedinStatsService.readAmount(prospect.signedAmount),
        0,
      )
  }

  /**
   * Indique si un prospect contribue au CA propose.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {boolean} True si le montant doit etre comptabilise.
   */
  private static isEligibleForProposalAmount(prospect: LinkedinProspect): boolean {
    return (
      hasReachedLinkedinStatus(prospect.status as LinkedinProspectStatus, LinkedinProspectStatus.PROPOSITION_ENVOYEE) &&
      LinkedinStatsService.readAmount(prospect.proposalAmount) > 0
    )
  }

  /**
   * Indique si un prospect contribue au CA signe.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {boolean} True si le montant doit etre comptabilise.
   */
  private static isEligibleForSignedAmount(prospect: LinkedinProspect): boolean {
    return (
      hasReachedLinkedinStatus(
        prospect.status as LinkedinProspectStatus,
        LinkedinProspectStatus.PROPOSITION_ACCEPTEE,
      ) && LinkedinStatsService.readAmount(prospect.signedAmount) > 0
    )
  }

  /**
   * Date de reference pour le CA propose dans les stats filtrees.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {DateTime | null} Date de reference.
   */
  private static resolveProposalAmountDate(prospect: LinkedinProspect): DateTime | null {
    return prospect.proposalSentAt ?? prospect.signedAt ?? prospect.updatedAt
  }

  /**
   * Date de reference pour le CA signe dans les stats filtrees.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {DateTime | null} Date de reference.
   */
  private static resolveSignedAmountDate(prospect: LinkedinProspect): DateTime | null {
    return prospect.signedAt ?? prospect.proposalSentAt ?? prospect.updatedAt
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
   * Indique si une date tombe dans la periode fournie.
   * @param {DateTime | null} date - Date a evaluer.
   * @param {StatsDateRange} range - Periode cible.
   * @returns {boolean} True si la date est incluse.
   */
  private static isInRange(date: DateTime | null, range: StatsDateRange): boolean {
    if (!date) {
      return false
    }

    const normalized: DateTime = date.setZone(LinkedinStatsService.parisZone)
    return normalized >= range.from && normalized <= range.to
  }

  /**
   * Calcule un pourcentage arrondi (0 si denominateur nul).
   * @param {number} numerator - Numerateur.
   * @param {number} denominator - Denominateur.
   * @returns {number} Pourcentage 0 - 100.
   */
  private static rate(numerator: number, denominator: number): number {
    if (denominator <= 0) {
      return 0
    }
    return Math.round((numerator / denominator) * 100)
  }

  /**
   * Indique si le statut courant a atteint un jalon du tunnel.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @param {LinkedinProspectStatus} status - Jalon attendu.
   * @returns {boolean} True si le jalon est atteint ou depasse.
   */
}
