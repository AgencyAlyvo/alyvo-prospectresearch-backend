import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception lancée lorsqu'une requête est incorrecte.
 * @class BadRequestException
 */
export default class BadRequestException extends Exception {
  public static status: number = 400
  public static code: string = 'E_BAD_REQUEST'

  /**
   * Gère l'exception en renvoyant une réponse JSON.
   * @param {BadRequestException} error - L'erreur à gérer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message || 'Bad Request',
    })
  }
}
