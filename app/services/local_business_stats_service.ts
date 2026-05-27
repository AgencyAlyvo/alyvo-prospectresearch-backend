import { DateTime } from 'luxon'
import LocalBusinessProspect from '#models/local_business_prospect'
import ProspectAction from '#models/prospect_action'
import type User from '#models/user'
import { LocalBusinessStatus } from '#enums/local_business_status'
import { ProspectActionType } from '#enums/prospect_action_type'
import { ProspectableType } from '#enums/prospectable_type'
import type { LocalBusinessStatsQuery } from '#types/payload/stats/local_business_stats_query'
import type { LocalBusinessStatsResponse } from '#types/response/stats/local_business_stats_response'

/**
 * Bornes temporelles normalisees pour filtrer les statistiques business locaux.
 */
type StatsDateRange = {
  from: DateTime
  to: DateTime
}

/**
 * Sous-ensemble de compteurs intermediaires utilises pour assembler la reponse.
 * Aligne sur les statuts commerciaux du tunnel : on ne compte que les jalons faits,
 * pas les rendez-vous simplement planifies ni les relances brutes.
 */
type LocalBusinessStatsCounters = {
  totalProspects: number
  withEmail: number
  withPhone: number
  withWebsite: number
  enriched: number
  emailsSent: number
  callsMade: number
  contactsMade: number
  positiveReplies: number
  negativeReplies: number
  discoveryCallsDone: number
  salesCallsDone: number
  proposalsSent: number
  proposalsAccepted: number
  proposalsRefused: number
  totalProposalAmount: number
  totalSignedAmount: number
  lighthouseAnalyzed: number
  averageSeoScore: number
  averagePerformanceScore: number
  averageAccessibilityScore: number
  averageBestPracticesScore: number
}

/**
 * Service metier pour les statistiques business locaux (parallele de LinkedinStatsService).
 */
export default class LocalBusinessStatsService {
  private static readonly parisZone: string = 'Europe/Paris'

  /**
   * Calcule toutes les statistiques business locaux de l'utilisateur.
   * Les taux sont retournes au format pourcentage (0 - 100).
   * @param {User} user - Utilisateur authentifie.
   * @param {LocalBusinessStatsQuery} [query] - Filtre de periode optionnel.
   * @returns {Promise<LocalBusinessStatsResponse>} Statistiques pretes a afficher.
   */
  public static async getLocalBusinessStats(
    user: User,
    query: LocalBusinessStatsQuery = {},
  ): Promise<LocalBusinessStatsResponse> {
    const all: LocalBusinessProspect[] = await LocalBusinessProspect.query().where('user_id', user.id)
    const range: StatsDateRange | null = LocalBusinessStatsService.resolveDateRange(query)

    if (!range) {
      return LocalBusinessStatsService.buildResponse(LocalBusinessStatsService.buildCumulativeCounters(all))
    }

    return LocalBusinessStatsService.buildResponse(await LocalBusinessStatsService.buildRangeCounters(all, user, range))
  }

  /**
   * Compteurs cumulatifs depuis le statut courant et les dates des prospects.
   * @param {LocalBusinessProspect[]} all - Prospects de l'utilisateur.
   * @returns {LocalBusinessStatsCounters} Compteurs cumulatifs.
   */
  private static buildCumulativeCounters(all: LocalBusinessProspect[]): LocalBusinessStatsCounters {
    const totalProspects: number = all.length
    const withEmail: number = all.filter((p: LocalBusinessProspect): boolean => Boolean(p.email)).length
    const withPhone: number = all.filter((p: LocalBusinessProspect): boolean => Boolean(p.phone)).length
    const withWebsite: number = all.filter((p: LocalBusinessProspect): boolean => p.hasWebsite).length
    const enriched: number = all.filter((p: LocalBusinessProspect): boolean => Boolean(p.enrichedAt)).length

    const emailsSent: number = all.filter(
      (p: LocalBusinessProspect): boolean => Boolean(p.firstContactAt) && p.contactChannel === 'email',
    ).length
    const callsMade: number = all.filter(
      (p: LocalBusinessProspect): boolean => Boolean(p.firstContactAt) && p.contactChannel === 'phone',
    ).length
    const contactsMade: number = all.filter((p: LocalBusinessProspect): boolean => Boolean(p.firstContactAt)).length

    const positiveReplies: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        p.positiveReply ||
        p.status === LocalBusinessStatus.REPONDU_INTERESSE ||
        p.status === LocalBusinessStatus.APPEL_DECOUVERTE_FAIT ||
        p.status === LocalBusinessStatus.APPEL_DE_VENTE_FAIT ||
        p.status === LocalBusinessStatus.PROPOSITION_ENVOYEE ||
        p.status === LocalBusinessStatus.PROPOSITION_ACCEPTEE,
    ).length
    const negativeReplies: number = all.filter(
      (p: LocalBusinessProspect): boolean => p.status === LocalBusinessStatus.REPONDU_NON_INTERESSE,
    ).length

    const discoveryCallsDone: number = all.filter((p: LocalBusinessProspect): boolean => p.discoveryCallDone).length
    const salesCallsDone: number = all.filter((p: LocalBusinessProspect): boolean => p.salesCallDone).length

    const proposalsSent: number = all.filter((p: LocalBusinessProspect): boolean => Boolean(p.proposalSentAt)).length
    const proposalsAccepted: number = all.filter(
      (p: LocalBusinessProspect): boolean => p.dealWon || p.status === LocalBusinessStatus.PROPOSITION_ACCEPTEE,
    ).length
    const proposalsRefused: number = all.filter(
      (p: LocalBusinessProspect): boolean => p.status === LocalBusinessStatus.PROPOSITION_REFUSEE,
    ).length

    const totalProposalAmount: number = LocalBusinessStatsService.sumProposalAmounts(all)
    const totalSignedAmount: number = LocalBusinessStatsService.sumSignedAmounts(all)

    const lighthouse: LocalBusinessProspect[] = all.filter((p: LocalBusinessProspect): boolean =>
      Boolean(p.lighthouseFetchedAt),
    )
    const lighthouseAnalyzed: number = lighthouse.length
    const averageSeoScore: number = LocalBusinessStatsService.average(
      lighthouse.map((p: LocalBusinessProspect): number | null => p.seoScore),
    )
    const averagePerformanceScore: number = LocalBusinessStatsService.average(
      lighthouse.map((p: LocalBusinessProspect): number | null => p.performanceScore),
    )
    const averageAccessibilityScore: number = LocalBusinessStatsService.average(
      lighthouse.map((p: LocalBusinessProspect): number | null => p.accessibilityScore),
    )
    const averageBestPracticesScore: number = LocalBusinessStatsService.average(
      lighthouse.map((p: LocalBusinessProspect): number | null => p.bestPracticesScore),
    )

    return {
      totalProspects,
      withEmail,
      withPhone,
      withWebsite,
      enriched,
      emailsSent,
      callsMade,
      contactsMade,
      positiveReplies,
      negativeReplies,
      discoveryCallsDone,
      salesCallsDone,
      proposalsSent,
      proposalsAccepted,
      proposalsRefused,
      totalProposalAmount,
      totalSignedAmount,
      lighthouseAnalyzed,
      averageSeoScore,
      averagePerformanceScore,
      averageAccessibilityScore,
      averageBestPracticesScore,
    }
  }

  /**
   * Compteurs limites a une periode via les jalons date des prospects et la timeline.
   * @param {LocalBusinessProspect[]} all - Prospects de l'utilisateur.
   * @param {User} user - Utilisateur authentifie.
   * @param {StatsDateRange} range - Periode a appliquer.
   * @returns {Promise<LocalBusinessStatsCounters>} Compteurs filtres.
   */
  private static async buildRangeCounters(
    all: LocalBusinessProspect[],
    user: User,
    range: StatsDateRange,
  ): Promise<LocalBusinessStatsCounters> {
    const createdInRange: LocalBusinessProspect[] = all.filter((p: LocalBusinessProspect): boolean =>
      LocalBusinessStatsService.isInRange(p.createdAt, range),
    )
    const enrichedInRange: LocalBusinessProspect[] = all.filter((p: LocalBusinessProspect): boolean =>
      LocalBusinessStatsService.isInRange(p.enrichedAt, range),
    )

    const totalProspects: number = createdInRange.length
    const withEmail: number = createdInRange.filter((p: LocalBusinessProspect): boolean => Boolean(p.email)).length
    const withPhone: number = createdInRange.filter((p: LocalBusinessProspect): boolean => Boolean(p.phone)).length
    const withWebsite: number = createdInRange.filter((p: LocalBusinessProspect): boolean => p.hasWebsite).length
    const enriched: number = enrichedInRange.length

    const emailsSent: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        LocalBusinessStatsService.isInRange(p.firstContactAt, range) && p.contactChannel === 'email',
    ).length
    const callsMade: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        LocalBusinessStatsService.isInRange(p.firstContactAt, range) && p.contactChannel === 'phone',
    ).length
    const contactsMade: number = all.filter((p: LocalBusinessProspect): boolean =>
      LocalBusinessStatsService.isInRange(p.firstContactAt, range),
    ).length

    const positiveReplies: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        LocalBusinessStatsService.isInRange(p.repliedAt, range) &&
        (p.positiveReply ||
          p.status === LocalBusinessStatus.REPONDU_INTERESSE ||
          p.status === LocalBusinessStatus.APPEL_DECOUVERTE_FAIT ||
          p.status === LocalBusinessStatus.APPEL_DE_VENTE_FAIT ||
          p.status === LocalBusinessStatus.PROPOSITION_ENVOYEE ||
          p.status === LocalBusinessStatus.PROPOSITION_ACCEPTEE),
    ).length
    const negativeReplies: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        LocalBusinessStatsService.isInRange(p.repliedAt, range) &&
        p.status === LocalBusinessStatus.REPONDU_NON_INTERESSE,
    ).length

    const discoveryCallsDone: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        p.discoveryCallDone && LocalBusinessStatsService.isInRange(p.discoveryCallAt, range),
    ).length
    const salesCallsDone: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        p.salesCallDone && LocalBusinessStatsService.isInRange(p.salesCallAt, range),
    ).length

    const proposalsSent: number = all.filter((p: LocalBusinessProspect): boolean =>
      LocalBusinessStatsService.isInRange(p.proposalSentAt, range),
    ).length
    const proposalsAccepted: number = all.filter(
      (p: LocalBusinessProspect): boolean =>
        (p.dealWon || p.status === LocalBusinessStatus.PROPOSITION_ACCEPTEE) &&
        LocalBusinessStatsService.isInRange(LocalBusinessStatsService.resolveSignedAmountDate(p), range),
    ).length
    const proposalsRefused: number = await LocalBusinessStatsService.countActionsInRange(
      user,
      [ProspectActionType.PROPOSAL_REFUSED],
      range,
    )

    const totalProposalAmount: number = LocalBusinessStatsService.sumProposalAmounts(all, range)
    const totalSignedAmount: number = LocalBusinessStatsService.sumSignedAmounts(all, range)

    const lighthouseInRange: LocalBusinessProspect[] = all.filter((p: LocalBusinessProspect): boolean =>
      LocalBusinessStatsService.isInRange(p.lighthouseFetchedAt, range),
    )
    const lighthouseAnalyzed: number = lighthouseInRange.length
    const averageSeoScore: number = LocalBusinessStatsService.average(
      lighthouseInRange.map((p: LocalBusinessProspect): number | null => p.seoScore),
    )
    const averagePerformanceScore: number = LocalBusinessStatsService.average(
      lighthouseInRange.map((p: LocalBusinessProspect): number | null => p.performanceScore),
    )
    const averageAccessibilityScore: number = LocalBusinessStatsService.average(
      lighthouseInRange.map((p: LocalBusinessProspect): number | null => p.accessibilityScore),
    )
    const averageBestPracticesScore: number = LocalBusinessStatsService.average(
      lighthouseInRange.map((p: LocalBusinessProspect): number | null => p.bestPracticesScore),
    )

    return {
      totalProspects,
      withEmail,
      withPhone,
      withWebsite,
      enriched,
      emailsSent,
      callsMade,
      contactsMade,
      positiveReplies,
      negativeReplies,
      discoveryCallsDone,
      salesCallsDone,
      proposalsSent,
      proposalsAccepted,
      proposalsRefused,
      totalProposalAmount,
      totalSignedAmount,
      lighthouseAnalyzed,
      averageSeoScore,
      averagePerformanceScore,
      averageAccessibilityScore,
      averageBestPracticesScore,
    }
  }

  /**
   * Assemble la reponse finale avec les taux calcules.
   * Le taux de reponse agrege reponses positives + negatives sur le total de contacts.
   * @param {LocalBusinessStatsCounters} counts - Compteurs bruts.
   * @returns {LocalBusinessStatsResponse} Statistiques completes.
   */
  private static buildResponse(counts: LocalBusinessStatsCounters): LocalBusinessStatsResponse {
    const totalReplies: number = counts.positiveReplies + counts.negativeReplies

    return {
      totalProspects: counts.totalProspects,
      withEmail: counts.withEmail,
      withPhone: counts.withPhone,
      withWebsite: counts.withWebsite,
      enriched: counts.enriched,
      emailsSent: counts.emailsSent,
      callsMade: counts.callsMade,
      contactsMade: counts.contactsMade,
      positiveReplies: counts.positiveReplies,
      negativeReplies: counts.negativeReplies,
      replyRate: LocalBusinessStatsService.rate(totalReplies, counts.contactsMade),
      positiveReplyRate: LocalBusinessStatsService.rate(counts.positiveReplies, totalReplies),
      discoveryCallsDone: counts.discoveryCallsDone,
      salesCallsDone: counts.salesCallsDone,
      proposalsSent: counts.proposalsSent,
      proposalsAccepted: counts.proposalsAccepted,
      proposalsRefused: counts.proposalsRefused,
      closingRate: LocalBusinessStatsService.rate(counts.proposalsAccepted, counts.proposalsSent),
      totalProposalAmount: counts.totalProposalAmount,
      totalSignedAmount: counts.totalSignedAmount,
      lighthouseAnalyzed: counts.lighthouseAnalyzed,
      averageSeoScore: counts.averageSeoScore,
      averagePerformanceScore: counts.averagePerformanceScore,
      averageAccessibilityScore: counts.averageAccessibilityScore,
      averageBestPracticesScore: counts.averageBestPracticesScore,
    }
  }

  /**
   * Compte les actions de la timeline correspondant aux types fournis dans la periode.
   * @param {User} user - Utilisateur authentifie.
   * @param {ProspectActionType[]} actionTypes - Types d'action a compter.
   * @param {StatsDateRange} range - Periode a appliquer.
   * @returns {Promise<number>} Nombre d'actions.
   */
  private static async countActionsInRange(
    user: User,
    actionTypes: ProspectActionType[],
    range: StatsDateRange,
  ): Promise<number> {
    const actions: ProspectAction[] = await ProspectAction.query()
      .where('user_id', user.id)
      .where('prospectable_type', ProspectableType.LOCAL_BUSINESS_PROSPECT)
      .whereIn('action_type', actionTypes as string[])
      .whereBetween('occurred_at', [range.from.toSQL()!, range.to.toSQL()!])

    return actions.length
  }

  /**
   * Resout les bornes de periode depuis la query string.
   * @param {LocalBusinessStatsQuery} query - Query validee.
   * @returns {StatsDateRange | null} Periode normalisee ou null si aucun filtre.
   */
  private static resolveDateRange(query: LocalBusinessStatsQuery): StatsDateRange | null {
    if (!query.from && !query.to) {
      return null
    }

    const from: DateTime = query.from
      ? DateTime.fromISO(query.from, { zone: LocalBusinessStatsService.parisZone }).startOf('day')
      : DateTime.fromMillis(0, { zone: LocalBusinessStatsService.parisZone })

    const to: DateTime = query.to
      ? DateTime.fromISO(query.to, { zone: LocalBusinessStatsService.parisZone }).endOf('day')
      : DateTime.now().setZone(LocalBusinessStatsService.parisZone).endOf('day')

    return { from, to }
  }

  /**
   * Somme les montants de propositions envoyees.
   * @param {LocalBusinessProspect[]} prospects - Prospects a evaluer.
   * @param {StatsDateRange | null} [range] - Periode optionnelle.
   * @returns {number} Total CA propose.
   */
  private static sumProposalAmounts(prospects: LocalBusinessProspect[], range: StatsDateRange | null = null): number {
    return prospects
      .filter((p: LocalBusinessProspect): boolean => LocalBusinessStatsService.isEligibleForProposalAmount(p))
      .filter((p: LocalBusinessProspect): boolean =>
        range
          ? LocalBusinessStatsService.isInRange(LocalBusinessStatsService.resolveProposalAmountDate(p), range)
          : true,
      )
      .reduce(
        (sum: number, p: LocalBusinessProspect): number => sum + LocalBusinessStatsService.readAmount(p.proposalAmount),
        0,
      )
  }

  /**
   * Somme les montants signes.
   * @param {LocalBusinessProspect[]} prospects - Prospects a evaluer.
   * @param {StatsDateRange | null} [range] - Periode optionnelle.
   * @returns {number} Total CA signe.
   */
  private static sumSignedAmounts(prospects: LocalBusinessProspect[], range: StatsDateRange | null = null): number {
    return prospects
      .filter((p: LocalBusinessProspect): boolean => LocalBusinessStatsService.isEligibleForSignedAmount(p))
      .filter((p: LocalBusinessProspect): boolean =>
        range ? LocalBusinessStatsService.isInRange(LocalBusinessStatsService.resolveSignedAmountDate(p), range) : true,
      )
      .reduce(
        (sum: number, p: LocalBusinessProspect): number => sum + LocalBusinessStatsService.readAmount(p.signedAmount),
        0,
      )
  }

  /**
   * Indique si un prospect contribue au CA propose.
   * @param {LocalBusinessProspect} prospect - Prospect a evaluer.
   * @returns {boolean} True si le montant doit etre comptabilise.
   */
  private static isEligibleForProposalAmount(prospect: LocalBusinessProspect): boolean {
    return Boolean(prospect.proposalSentAt) && LocalBusinessStatsService.readAmount(prospect.proposalAmount) > 0
  }

  /**
   * Indique si un prospect contribue au CA signe.
   * @param {LocalBusinessProspect} prospect - Prospect a evaluer.
   * @returns {boolean} True si le montant doit etre comptabilise.
   */
  private static isEligibleForSignedAmount(prospect: LocalBusinessProspect): boolean {
    return (
      (prospect.dealWon || prospect.status === LocalBusinessStatus.PROPOSITION_ACCEPTEE) &&
      LocalBusinessStatsService.readAmount(prospect.signedAmount) > 0
    )
  }

  /**
   * Date de reference pour le CA propose dans les stats filtrees.
   * @param {LocalBusinessProspect} prospect - Prospect a evaluer.
   * @returns {DateTime | null} Date de reference.
   */
  private static resolveProposalAmountDate(prospect: LocalBusinessProspect): DateTime | null {
    return prospect.proposalSentAt ?? prospect.signedAt ?? prospect.updatedAt
  }

  /**
   * Date de reference pour le CA signe dans les stats filtrees.
   * @param {LocalBusinessProspect} prospect - Prospect a evaluer.
   * @returns {DateTime | null} Date de reference.
   */
  private static resolveSignedAmountDate(prospect: LocalBusinessProspect): DateTime | null {
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

    const normalized: DateTime = date.setZone(LocalBusinessStatsService.parisZone)
    return normalized >= range.from && normalized <= range.to
  }

  /**
   * Calcule une moyenne arrondie a partir de valeurs eventuellement nulles (0 si vide).
   * @param {(number | null)[]} values - Valeurs a moyenner.
   * @returns {number} Moyenne arrondie a l'entier.
   */
  private static average(values: (number | null)[]): number {
    const filtered: number[] = values.filter((v: number | null): v is number => v !== null && Number.isFinite(v))
    if (filtered.length === 0) {
      return 0
    }
    const total: number = filtered.reduce((sum: number, v: number): number => sum + v, 0)
    return Math.round(total / filtered.length)
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
}
