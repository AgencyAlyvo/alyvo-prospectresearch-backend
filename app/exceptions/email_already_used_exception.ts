import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Exception levee quand un email est deja associe a un compte.
 */
export default class EmailAlreadyUsedException extends Exception {
  public static status: number = 409
  public static code: string = 'E_EMAIL_ALREADY_USED'

  /**
   * Cree l'exception de conflit email.
   */
  constructor() {
    super('Email already used')
  }

  /**
   * Gere l'exception en renvoyant une reponse JSON.
   * @param {EmailAlreadyUsedException} error - L'erreur a gerer.
   * @param {HttpContext} ctx - Le contexte HTTP.
   */
  public handle(error: this, ctx: HttpContext): void {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
