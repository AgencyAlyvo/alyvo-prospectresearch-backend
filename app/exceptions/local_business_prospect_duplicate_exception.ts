import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand un business local existe deja pour le critere de
 * deduplication retenu (cle OSM, email, ou nom + ville).
 */
export default class LocalBusinessProspectDuplicateException extends Exception {
  public static status: number = 409
  public static code: string = 'E_LOCAL_BUSINESS_PROSPECT_DUPLICATE'

  /**
   * Cree l'exception de doublon business local.
   * @param {string} reason - Critere de deduplication en echec.
   */
  constructor(reason: string) {
    super(`Business local deja existant (${reason})`)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LocalBusinessProspectDuplicateException} error - Erreur a gerer.
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
