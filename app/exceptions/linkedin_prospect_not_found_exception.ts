import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand un prospect LinkedIn demande n'existe pas pour l'utilisateur courant.
 */
export default class LinkedinProspectNotFoundException extends Exception {
  public static status: number = 404
  public static code: string = 'E_LINKEDIN_PROSPECT_NOT_FOUND'

  /**
   * Cree l'exception de prospect introuvable.
   */
  constructor() {
    super('Prospect LinkedIn introuvable')
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LinkedinProspectNotFoundException} error - L'erreur a gerer.
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
