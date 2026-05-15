import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception lancée lorsqu'un utilisateur non autorisé tente d'accéder à une ressource.
 * @class UnauthorizedException
 */
export default class UnauthorizedException extends Exception {
  public static status: number = 401
  public static code: string = 'E_UNAUTHORIZED'

  /**
   * Gère l'exception en renvoyant une réponse JSON.
   * @param {UnauthorizedException} error - L'erreur à gérer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message || 'Unauthorized Access',
    })
  }
}
