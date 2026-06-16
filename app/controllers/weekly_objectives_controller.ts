import WeeklyObjectiveService from '#services/weekly_objective_service'
import WeeklyObjectiveTransformer from '#transformers/weekly_objective_transformer'
import type WeeklyObjective from '#models/weekly_objective'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controleur de l'objectif hebdomadaire (cahier paragraphe 5.2 section 1).
 */
export default class WeeklyObjectivesController {
  /**
   * @summary Objectif de la semaine courante
   * @description Renvoie l'objectif et la progression d'invitations LinkedIn de la semaine ISO courante.
   * @responseBody 200 - Objectif courant
   */
  /**
   * Renvoie l'objectif hebdomadaire courant.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async getCurrentWeeklyObjective({ auth, serialize }: HttpContext): Promise<unknown> {
    const objective: WeeklyObjective = await WeeklyObjectiveService.getCurrentWeeklyObjective(auth.user!)
    return serialize(WeeklyObjectiveTransformer.transform(objective))
  }
}
