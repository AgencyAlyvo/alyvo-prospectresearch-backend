import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Middleware qui check si l'utilisateur est authentifié.
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {},
  ) {
    try {
      // On check si l'utilisateur est authentifié
      await ctx.auth.authenticateUsing(options.guards)

      // Si l'utilisateur est authentifié, on passe au middleware suivant ou au contrôleur
      await next()
    } catch {
      return ctx.response.unauthorized({ message: 'Authentication required.' })
    }
  }
}
