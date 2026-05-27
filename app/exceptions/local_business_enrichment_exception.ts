import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand l'enrichissement business local via n8n est indisponible
 * ou retourne une reponse inexploitable.
 */
export default class LocalBusinessEnrichmentException extends Exception {
  public static code: string = 'E_LOCAL_BUSINESS_ENRICHMENT_FAILED'

  /**
   * Cree l'exception d'enrichissement business local.
   * @param {string} [message] - Message d'erreur.
   * @param {number} [status] - Code HTTP.
   */
  constructor(
    message: string = 'Enrichissement business local indisponible',
    public status: number = 502,
  ) {
    super(message)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LocalBusinessEnrichmentException} error - Erreur a gerer.
   * @param {HttpContext} ctx - Contexte HTTP.
   * @returns {void}
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: LocalBusinessEnrichmentException.code,
      message: error.message,
    })
  }
}
