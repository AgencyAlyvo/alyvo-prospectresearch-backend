import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception lancée lorsqu'une action est interdite pour l'utilisateur.
 * @class ForbiddenException
 */
export default class ForbiddenException extends Exception {
  public static status: number = 403
  public static code: string = 'E_FORBIDDEN'

  /**
   * Gère l'exception en renvoyant une réponse JSON.
   * @param {ForbiddenException} error - L'erreur à gérer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message || 'Forbidden Access',
    })
  }
}
