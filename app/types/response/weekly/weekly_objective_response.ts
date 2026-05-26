/**
 * Reponse de la route GET /weekly-objectives/current (cahier paragraphe 5.2 section 1).
 * Inclut la progression deja calculee cote serveur.
 */
export type WeeklyObjectiveResponse = {
  week: string
  invitesTarget: number
  invitesSent: number
  invitesRemaining: number
  progressionPercent: number
}
