import { DateTime } from 'luxon'
import WeeklyObjective from '#models/weekly_objective'
import LinkedinProspect from '#models/linkedin_prospect'
import type UserSetting from '#models/user_setting'
import type User from '#models/user'
import UserSettingsService from '#services/user_settings_service'

/**
 * Service metier pour l'objectif hebdomadaire d'invitations LinkedIn
 * (cahier paragraphe 5.2 section 1).
 */
export default class WeeklyObjectiveService {
  /**
   * Calcule l'identifiant de semaine ISO courante au format YYYY-Www en fuseau Paris.
   * @returns {string} Identifiant ISO de la semaine.
   */
  public static getCurrentIsoWeek(): string {
    const now: DateTime = DateTime.now().setZone('Europe/Paris')
    return `${now.weekYear}-W${String(now.weekNumber).padStart(2, '0')}`
  }

  /**
   * Recupere l'objectif de la semaine courante (cree si absent) et renvoie le compteur a jour.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<WeeklyObjective>} Objectif synchronise avec invitesSent recalcule.
   */
  public static async getCurrentWeeklyObjective(user: User): Promise<WeeklyObjective> {
    const week: string = WeeklyObjectiveService.getCurrentIsoWeek()
    return await WeeklyObjectiveService.ensureWeeklyObjective(user, week)
  }

  /**
   * Incremente le compteur d'invitations envoyees pour la semaine courante.
   * Appele apres chaque action markInvitationSent.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<WeeklyObjective>} Objectif a jour.
   */
  public static async incrementInvitesSent(user: User): Promise<WeeklyObjective> {
    const objective: WeeklyObjective = await WeeklyObjectiveService.getCurrentWeeklyObjective(user)
    objective.invitesSent = await WeeklyObjectiveService.computeInvitesSentForWeek(user, objective.week)
    await objective.save()
    return objective
  }

  /**
   * Recalcule a partir de la base le nombre d'invitations envoyees sur une semaine.
   * @param {User} user - Utilisateur authentifie.
   * @param {string} week - Semaine ISO YYYY-Www.
   * @returns {Promise<number>} Total recalcule.
   */
  public static async computeInvitesSentForWeek(user: User, week: string): Promise<number> {
    const result: { total: number | string | null } | null = await LinkedinProspect.query()
      .where('user_id', user.id)
      .andWhere('added_at_week', week)
      .andWhereNotNull('invitation_sent_at')
      .count('* as total')
      .first()
      .then((row: LinkedinProspect | null): { total: number | string | null } | null =>
        row ? (row.$extras as { total: number | string | null }) : null,
      )
    return result ? Number(result.total ?? 0) : 0
  }

  /**
   * Garantit l'existence d'un enregistrement pour la semaine demandee.
   * @param {User} user - Utilisateur authentifie.
   * @param {string} week - Semaine ISO.
   * @returns {Promise<WeeklyObjective>} Enregistrement existant ou cree.
   */
  private static async ensureWeeklyObjective(user: User, week: string): Promise<WeeklyObjective> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(user)
    const invitesSent: number = await WeeklyObjectiveService.computeInvitesSentForWeek(user, week)
    const existing: WeeklyObjective | null = await WeeklyObjective.query()
      .where('user_id', user.id)
      .andWhere('week', week)
      .first()
    if (existing) {
      if (existing.invitesTarget !== settings.maxInvitesPerWeek || existing.invitesSent !== invitesSent) {
        existing.invitesTarget = settings.maxInvitesPerWeek
        existing.invitesSent = invitesSent
        await existing.save()
      }
      return existing
    }
    return await WeeklyObjective.create({
      userId: user.id,
      week,
      invitesTarget: settings.maxInvitesPerWeek,
      invitesSent,
    })
  }
}
