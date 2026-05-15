import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

/**
 * Health middleware
 * @class HealthMiddleware
 */
export default class HealthMiddleware {
  /**
   * Handle the request
   * @param {HttpContext} ctx - The HTTP context
   * @param {() => Promise<void>} next - The next middleware
   * @returns {Promise<void>}
   */
  public async handle({ request, response }: HttpContext, next: () => Promise<void>): Promise<void> {
    if (env.get('NODE_ENV') === 'test' || env.get('NODE_ENV') === 'development') {
      // Si la variable d'environnement NODE_ENV est 'test' ou 'development', on passe au middleware suivant ou au contrôleur
      await next()
      return
    }

    const apiKey: string | undefined = request.header('X-API-KEY')
    const apiKeySecret: string = env.get('HEALTH_API_KEY_SECRET')
    if (!apiKey || apiKey !== apiKeySecret) {
      response.status(401).send('Unauthorized')
      return
    }

    // Si la clé API est valide, passe au middleware suivant ou au contrôleur
    await next()
  }
}
