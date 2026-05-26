import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand un prospect LinkedIn existe deja pour le critere de
 * deduplication retenu (URL LinkedIn, email, ou nom + entreprise) - voir cahier paragraphe 17.1.
 */
export default class LinkedinProspectDuplicateException extends Exception {
  public static status: number = 409
  public static code: string = 'E_LINKEDIN_PROSPECT_DUPLICATE'

  /**
   * Cree l'exception de doublon.
   * @param {string} reason - Detail du critere ayant matche (linkedin_url, email, ...).
   */
  constructor(reason: string) {
    super(`Prospect LinkedIn deja existant (${reason})`)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LinkedinProspectDuplicateException} error - L'erreur a gerer.
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
