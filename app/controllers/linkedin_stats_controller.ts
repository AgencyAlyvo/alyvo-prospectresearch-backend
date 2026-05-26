import LinkedinStatsService from '#services/linkedin_stats_service'
import type { LinkedinStatsQuery } from '#types/payload/stats/linkedin_stats_query'
import type { LinkedinStatsResponse } from '#types/response/stats/linkedin_stats_response'
import { linkedinStatsValidator } from '#validators/stats/linkedin_stats_validator'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controleur des statistiques (cahier paragraphe 13).
 */
export default class LinkedinStatsController {
  /**
   * @summary Statistiques LinkedIn
   * @description Renvoie les statistiques detaillees du canal LinkedIn.
   * @responseBody 200 - Statistiques
   */
  /**
   * Renvoie les statistiques LinkedIn.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async getLinkedinStats({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const query: LinkedinStatsQuery = (await request.validateUsing(linkedinStatsValidator)) as LinkedinStatsQuery
    const stats: LinkedinStatsResponse = await LinkedinStatsService.getLinkedinStats(auth.user!, query)
    return serialize(stats)
  }
}
