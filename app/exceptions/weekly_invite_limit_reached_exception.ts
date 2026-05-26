import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand l'utilisateur tente de marquer une invitation au dela
 * de sa limite hebdomadaire (parametres user_settings.max_invites_per_week,
 * voir cahier paragraphe 5.2 section 1 et paragraphe 18.1).
 */
export default class WeeklyInviteLimitReachedException extends Exception {
  public static status: number = 422
  public static code: string = 'E_WEEKLY_INVITE_LIMIT_REACHED'

  /**
   * Cree l'exception de plafond hebdomadaire atteint.
   * @param {number} limit - Plafond configure par l'utilisateur.
   */
  constructor(limit: number) {
    super(`Limite hebdomadaire d'invitations LinkedIn atteinte (${limit})`)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {WeeklyInviteLimitReachedException} error - L'erreur a gerer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   * @returns {void}
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
