import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception lancée lorsqu'une erreur interne du serveur survient.
 * @class InternalServerErrorException
 */
export default class InternalServerErrorException extends Exception {
  public static status: number = 500
  public static code: string = 'E_INTERNAL_SERVER_ERROR'

  /**
   * Gère l'exception en renvoyant une réponse JSON.
   * @param {InternalServerErrorException} error - L'erreur à gérer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message || 'Internal Server Error',
    })
  }
}
