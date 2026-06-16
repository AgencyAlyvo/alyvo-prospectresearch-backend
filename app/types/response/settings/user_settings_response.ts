/**
 * Forme serialisable des parametres utilisateur (cahier paragraphe 14).
 */
export type UserSettingsResponse = {
  maxInvitesPerWeek: number
  relance1DelayDays: number
  relance2DelayDays: number
  relance3DelayDays: number
}
