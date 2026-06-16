import vine from '@vinejs/vine'

/**
 * Valide les filtres de periode des statistiques LinkedIn.
 */
export const linkedinStatsValidator = vine.compile(
  vine.object({
    from: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
)
