import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand l'enrichissement LinkedIn via n8n est indisponible
 * ou retourne une reponse inexploitable.
 */
export default class LinkedinProfileEnrichmentException extends Exception {
  public static code: string = 'E_LINKEDIN_PROFILE_ENRICHMENT_FAILED'

  /**
   * Cree l'exception d'enrichissement.
   * @param {string} message - Message utilisateur.
   * @param {number} status - Statut HTTP.
   */
  constructor(
    message: string = 'Enrichissement LinkedIn indisponible',
    public status: number = 502,
  ) {
    super(message)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {LinkedinProfileEnrichmentException} error - L'erreur a gerer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   * @returns {void}
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: LinkedinProfileEnrichmentException.code,
      message: error.message,
    })
  }
}
