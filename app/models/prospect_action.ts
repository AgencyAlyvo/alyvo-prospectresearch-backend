import { ProspectActionSchema } from '#database/schema'

/**
 * Action journalisee dans la timeline d'un prospect.
 * Relation ciblee par prospectableType + prospectableId.
 */
export default class ProspectAction extends ProspectActionSchema {
  public static table = 'prospect_actions'
}
