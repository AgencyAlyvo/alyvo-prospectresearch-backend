import { DateTime } from 'luxon'
import ProspectAction from '#models/prospect_action'
import type User from '#models/user'
import type { ProspectableType } from '#enums/prospectable_type'
import type { ProspectActionType } from '#enums/prospect_action_type'
import type { ProspectChannel } from '#enums/prospect_channel'

/**
 * Service metier pour la timeline d'actions des prospects (cahier paragraphes 12 et 15.4).
 */
export default class ProspectActionService {
  /**
   * Cree une action de timeline en interne (utilise par les autres services).
   * @param {object} params - Parametres de l'action.
   * @param {ProspectableType} params.prospectableType - Type polymorphe.
   * @param {number} params.prospectableId - Identifiant du prospect.
   * @param {ProspectActionType} params.actionType - Type d'action.
   * @param {ProspectChannel} params.channel - Canal physique.
   * @param {User} params.user - Utilisateur authentifie.
   * @param {string | null} [params.content] - Contenu eventuel.
   * @param {DateTime} [params.occurredAt] - Date de l'action (default: maintenant).
   * @returns {Promise<ProspectAction>} Action creee.
   */
  public static async logAction(params: {
    prospectableType: ProspectableType
    prospectableId: number
    actionType: ProspectActionType
    channel: ProspectChannel
    user: User
    content?: string | null
    occurredAt?: DateTime
  }): Promise<ProspectAction> {
    return await ProspectAction.create({
      userId: params.user.id,
      prospectableType: params.prospectableType,
      prospectableId: params.prospectableId,
      actionType: params.actionType,
      channel: params.channel,
      content: params.content ?? null,
      occurredAt: params.occurredAt ?? DateTime.now(),
    })
  }
}
