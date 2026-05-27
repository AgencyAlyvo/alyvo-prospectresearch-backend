import type { ProspectBulkAction } from '#enums/prospect_bulk_action'

/**
 * Corps d'une requete d'action groupée sur des prospects.
 */
export type ProspectBulkActionPayload = {
  ids: number[]
  action: ProspectBulkAction
}

/**
 * Reponse d'une action groupée.
 */
export type ProspectBulkActionResult = {
  affected: number
}
