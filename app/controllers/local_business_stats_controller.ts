import LocalBusinessStatsService from '#services/local_business_stats_service'
import type { LocalBusinessStatsQuery } from '#types/payload/stats/local_business_stats_query'
import type { LocalBusinessStatsResponse } from '#types/response/stats/local_business_stats_response'
import { localBusinessStatsValidator } from '#validators/stats/local_business_stats_validator'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controleur des statistiques business locaux (parallele de LinkedinStatsController).
 */
export default class LocalBusinessStatsController {
  /**
   * @summary Statistiques business locaux
   * @description Renvoie les statistiques detaillees du canal business locaux.
   * @responseBody 200 - Statistiques
   */
  /**
   * Renvoie les statistiques business locaux.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async getLocalBusinessStats({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const query: LocalBusinessStatsQuery = (await request.validateUsing(
      localBusinessStatsValidator,
    )) as LocalBusinessStatsQuery
    const stats: LocalBusinessStatsResponse = await LocalBusinessStatsService.getLocalBusinessStats(auth.user!, query)
    return serialize(stats)
  }
}
