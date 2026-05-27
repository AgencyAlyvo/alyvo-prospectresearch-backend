import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand un business local demande n'existe pas pour l'utilisateur courant.
 */
export default class LocalBusinessProspectNotFoundException extends Exception {
  public static status: number = 404
  public static code: string = 'E_LOCAL_BUSINESS_PROSPECT_NOT_FOUND'

  /**
   * Cree l'exception de business local introuvable.
   */
  constructor() {
    super('Business local introuvable')
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LocalBusinessProspectNotFoundException} error - Erreur a gerer.
   * @param {HttpContext} ctx - Contexte HTTP.
   * @returns {void}
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
