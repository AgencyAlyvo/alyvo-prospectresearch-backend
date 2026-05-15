import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception lancée lorsqu'une ressource n'est pas trouvée.
 * @class NotFoundException
 */
export default class NotFoundException extends Exception {
  public static status: number = 404
  public static code: string = 'E_NOT_FOUND'

  /**
   * Gère l'exception en renvoyant une réponse JSON.
   * @param {NotFoundException} error - L'erreur à gérer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message || 'Resource Not Found',
    })
  }
}
