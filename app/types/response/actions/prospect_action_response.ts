import type { ProspectActionType } from '#enums/prospect_action_type'
import type { ProspectChannel } from '#enums/prospect_channel'
import type { ProspectableType } from '#enums/prospectable_type'

/**
 * Forme serialisable d'une action de timeline (cahier paragraphe 15.4).
 */
export type ProspectActionResponse = {
  id: number
  prospectableType: ProspectableType
  prospectableId: number
  actionType: ProspectActionType
  channel: ProspectChannel
  content: string | null
  occurredAt: string
  createdAt: string
}

/**
 * Liste d'actions, utilisee a la fois pour la timeline d'un prospect
 * et pour la vue "Relances LinkedIn" du paragraphe 12.
 */
export type ProspectActionsListResponse = {
  data: ProspectActionResponse[]
}
