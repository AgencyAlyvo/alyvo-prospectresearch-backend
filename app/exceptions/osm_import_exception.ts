import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand l'import OSM echoue (fichier introuvable, format invalide, etc.).
 */
export default class OsmImportException extends Exception {
  public static code: string = 'E_OSM_IMPORT_FAILED'

  /**
   * Cree l'exception d'import OSM.
   * @param {string} [message] - Message d'erreur.
   * @param {number} [status] - Code HTTP.
   */
  constructor(
    message: string = 'Import OpenStreetMap impossible',
    public status: number = 500,
  ) {
    super(message)
  }

  /**
   * Renvoie une reponse JSON normalisee.
   * @param {OsmImportException} error - Erreur a gerer.
   * @param {HttpContext} ctx - Contexte HTTP.
   * @returns {void}
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: OsmImportException.code,
      message: error.message,
    })
  }
}
