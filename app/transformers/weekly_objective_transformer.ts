import type WeeklyObjective from '#models/weekly_objective'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { WeeklyObjectiveResponse } from '#types/response/weekly/weekly_objective_response'

/**
 * Transformer pour l'objectif hebdomadaire (cahier paragraphe 5.2 section 1).
 * Calcule la progression cote serveur pour eviter toute divergence cote client.
 */
export default class WeeklyObjectiveTransformer extends BaseTransformer<WeeklyObjective> {
  /**
   * Transforme l'objectif en payload pret a afficher.
   * @returns {WeeklyObjectiveResponse} Reponse serialisable.
   */
  public toObject(): WeeklyObjectiveResponse {
    const remaining: number = Math.max(0, this.resource.invitesTarget - this.resource.invitesSent)
    const progression: number =
      this.resource.invitesTarget > 0
        ? Math.min(100, Math.round((this.resource.invitesSent / this.resource.invitesTarget) * 100))
        : 0
    return {
      week: this.resource.week,
      invitesTarget: this.resource.invitesTarget,
      invitesSent: this.resource.invitesSent,
      invitesRemaining: remaining,
      progressionPercent: progression,
    }
  }
}
