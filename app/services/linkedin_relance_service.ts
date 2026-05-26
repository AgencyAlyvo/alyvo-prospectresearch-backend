import { DateTime } from 'luxon'
import LinkedinProspect from '#models/linkedin_prospect'
import type UserSetting from '#models/user_setting'
import type User from '#models/user'
import { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'
import LinkedinProspectTransformer from '#transformers/linkedin_prospect_transformer'
import UserSettingsService from '#services/user_settings_service'
import type { DueRelanceResponse } from '#types/response/linkedin/due_relance_response'
import { getLinkedinRelancesCount } from '#utils/linkedin_relance_count'

/**
 * Etat calcule de la prochaine relance LinkedIn d'un prospect.
 */
export type RelanceState = {
  nextRelanceNumber: 1 | 2 | 3 | null
  nextRelanceDueAt: DateTime | null
  isDue: boolean
}

/**
 * Service metier des relances LinkedIn calculees depuis message1SentAt et les delais utilisateur.
 */
export default class LinkedinRelanceService {
  private static readonly parisZone: string = 'Europe/Paris'

  /**
   * Liste les relances LinkedIn dues pour l'utilisateur.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<DueRelanceResponse[]>} Relances a traiter, triees par echeance.
   */
  public static async listDueRelances(user: User): Promise<DueRelanceResponse[]> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(user)
    const prospects: LinkedinProspect[] = await LinkedinProspect.query()
      .where('user_id', user.id)
      .whereNotNull('message_1_sent_at')

    const dueRelances: DueRelanceResponse[] = []

    for (const prospect of prospects) {
      const state: RelanceState | null = LinkedinRelanceService.getRelanceState(prospect, settings)
      if (!state?.nextRelanceNumber || !state.nextRelanceDueAt || !state.isDue) {
        continue
      }

      if (!prospect.message1SentAt) {
        continue
      }

      const today: DateTime = DateTime.now().setZone(LinkedinRelanceService.parisZone).startOf('day')
      const dueDay: DateTime = state.nextRelanceDueAt.startOf('day')
      const daysOverdue: number = Math.max(0, Math.floor(today.diff(dueDay, 'days').days))

      dueRelances.push({
        prospect: new LinkedinProspectTransformer(prospect).toObject(),
        relanceNumber: state.nextRelanceNumber,
        dueAt: state.nextRelanceDueAt.toISO()!,
        message1SentAt: prospect.message1SentAt.toISO()!,
        isDue: state.isDue,
        daysOverdue,
      })
    }

    return dueRelances.sort(
      (a: DueRelanceResponse, b: DueRelanceResponse): number =>
        DateTime.fromISO(a.dueAt).toMillis() - DateTime.fromISO(b.dueAt).toMillis(),
    )
  }

  /**
   * Synchronise nextAction et nextActionAt selon l'etat de relance calcule.
   * @param {LinkedinProspect} prospect - Prospect a mettre a jour.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<void>}
   */
  public static async syncProspectRelanceFields(prospect: LinkedinProspect, user: User): Promise<void> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(user)
    const state: RelanceState | null = LinkedinRelanceService.getRelanceState(prospect, settings)

    if (!state?.nextRelanceNumber || !state.nextRelanceDueAt) {
      if (prospect.message1SentAt && !prospect.repliedAt && getLinkedinRelancesCount(prospect) >= 3) {
        prospect.nextAction = 'Marquer non repondu apres toutes les relances'
        prospect.nextActionAt = null
      }
      return
    }

    const dueLabel: string = state.nextRelanceDueAt.setLocale('fr').toFormat('d MMM yyyy')

    const dueDate: DateTime = state.nextRelanceDueAt.startOf('day')

    if (state.isDue) {
      prospect.nextAction = `Envoyer relance ${state.nextRelanceNumber}`
      prospect.nextActionAt = dueDate
      return
    }

    prospect.nextAction = `Relance ${state.nextRelanceNumber} prevue le ${dueLabel}`
    prospect.nextActionAt = dueDate
  }

  /**
   * Calcule la prochaine relance attendue pour un prospect.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @param {UserSetting} settings - Parametres utilisateur.
   * @returns {RelanceState | null} Etat de relance ou null si hors tunnel.
   */
  public static getRelanceState(prospect: LinkedinProspect, settings: UserSetting): RelanceState | null {
    if (!LinkedinRelanceService.isInRelanceFunnel(prospect)) {
      return null
    }

    const nextRelanceNumber: 1 | 2 | 3 | null = LinkedinRelanceService.getNextRelanceNumber(prospect)
    if (!nextRelanceNumber || !prospect.message1SentAt) {
      return null
    }

    const message1Day: DateTime = prospect.message1SentAt.setZone(LinkedinRelanceService.parisZone).startOf('day')
    const delayDays: number = LinkedinRelanceService.getDelayDays(settings, nextRelanceNumber)
    const dueAt: DateTime = message1Day.plus({ days: delayDays })
    const today: DateTime = DateTime.now().setZone(LinkedinRelanceService.parisZone).startOf('day')

    return {
      nextRelanceNumber,
      nextRelanceDueAt: dueAt,
      isDue: today.toMillis() >= dueAt.toMillis(),
    }
  }

  /**
   * Indique si le prospect est encore dans la sequence de relances LinkedIn.
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {boolean} True si une relance peut encore etre attendue.
   */
  public static isInRelanceFunnel(prospect: LinkedinProspect): boolean {
    if (!prospect.message1SentAt || prospect.repliedAt) {
      return false
    }

    const status: LinkedinProspectStatus = prospect.status as LinkedinProspectStatus
    const excludedStatuses: LinkedinProspectStatus[] = [
      LinkedinProspectStatus.REPONDU_A_QUALIFIER,
      LinkedinProspectStatus.REPONDU_INTERESSE,
      LinkedinProspectStatus.REPONDU_NON_INTERESSE,
      LinkedinProspectStatus.NON_REPONDU_LINKEDIN,
      LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT,
      LinkedinProspectStatus.APPEL_DE_VENTE_FAIT,
      LinkedinProspectStatus.PROPOSITION_ENVOYEE,
      LinkedinProspectStatus.PROPOSITION_ACCEPTEE,
      LinkedinProspectStatus.PROPOSITION_REFUSEE,
      LinkedinProspectStatus.ARCHIVE,
    ]

    if (excludedStatuses.includes(status)) {
      return false
    }

    return LinkedinRelanceService.getNextRelanceNumber(prospect) !== null
  }

  /**
   * Retourne le numero de la prochaine relance a envoyer (1, 2 ou 3).
   * @param {LinkedinProspect} prospect - Prospect a evaluer.
   * @returns {1 | 2 | 3 | null} Numero de relance ou null si termine.
   */
  public static getNextRelanceNumber(prospect: LinkedinProspect): 1 | 2 | 3 | null {
    if (!prospect.relance1At) {
      return 1
    }
    if (!prospect.relance2At) {
      return 2
    }
    if (!prospect.relance3At) {
      return 3
    }

    return null
  }

  /**
   * Retourne le delai configure pour une relance donnee.
   * @param {UserSetting} settings - Parametres utilisateur.
   * @param {1 | 2 | 3} relanceNumber - Numero de relance.
   * @returns {number} Delai en jours.
   */
  private static getDelayDays(settings: UserSetting, relanceNumber: 1 | 2 | 3): number {
    if (relanceNumber === 1) {
      return settings.relance1DelayDays
    }
    if (relanceNumber === 2) {
      return settings.relance2DelayDays
    }

    return settings.relance3DelayDays
  }
}
