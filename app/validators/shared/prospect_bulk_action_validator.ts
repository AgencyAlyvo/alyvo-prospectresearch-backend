import vine from '@vinejs/vine'
import { ProspectBulkAction } from '#enums/prospect_bulk_action'

const actionValues: string[] = Object.values(ProspectBulkAction)

/**
 * Valide une action groupée sur une liste d'identifiants prospects.
 */
export const prospectBulkActionValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number().positive()).minLength(1).maxLength(500),
    action: vine.enum(actionValues),
  }),
)
