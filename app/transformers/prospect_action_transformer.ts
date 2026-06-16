import type ProspectAction from '#models/prospect_action'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { ProspectActionType } from '#enums/prospect_action_type'
import type { ProspectChannel } from '#enums/prospect_channel'
import type { ProspectableType } from '#enums/prospectable_type'
import type { ProspectActionResponse } from '#types/response/actions/prospect_action_response'

/**
 * Transformer pour une action de timeline (cahier paragraphe 15.4).
 */
export default class ProspectActionTransformer extends BaseTransformer<ProspectAction> {
  /**
   * Convertit l'action en JSON public.
   * @returns {ProspectActionResponse} Action serialisable.
   */
  public toObject(): ProspectActionResponse {
    return {
      id: this.resource.id,
      prospectableType: this.resource.prospectableType as ProspectableType,
      prospectableId: this.resource.prospectableId,
      actionType: this.resource.actionType as ProspectActionType,
      channel: this.resource.channel as ProspectChannel,
      content: this.resource.content,
      occurredAt: this.resource.occurredAt.toISO()!,
      createdAt: this.resource.createdAt.toISO()!,
    }
  }
}
