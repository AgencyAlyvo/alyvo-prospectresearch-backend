/**
 * Payload valide pour modifier les parametres utilisateur (cahier paragraphe 14).
 */
export type UpdateUserSettingsPayload = {
  maxInvitesPerWeek?: number
  relance1DelayDays?: number
  relance2DelayDays?: number
  relance3DelayDays?: number
}
