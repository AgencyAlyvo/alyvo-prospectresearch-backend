import { WeeklyObjectiveSchema } from '#database/schema'

/**
 * Objectif hebdomadaire d'invitations LinkedIn (cahier paragraphe 5.2 section 1).
 * Cle metier composee : (userId, week) unique.
 */
export default class WeeklyObjective extends WeeklyObjectiveSchema {
  public static table = 'weekly_objectives'
}
