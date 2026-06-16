import vine from '@vinejs/vine'

/**
 * Valide les parametres utilisateur (cahier paragraphe 14).
 */
export const updateUserSettingsValidator = vine.compile(
  vine.object({
    maxInvitesPerWeek: vine.number().min(1).max(1000).optional(),
    relance1DelayDays: vine.number().min(0).max(60).optional(),
    relance2DelayDays: vine.number().min(0).max(60).optional(),
    relance3DelayDays: vine.number().min(0).max(60).optional(),
  }),
)
