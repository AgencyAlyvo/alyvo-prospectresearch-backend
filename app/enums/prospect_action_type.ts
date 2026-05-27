/**
 * Types d'actions journalisees dans la timeline (table prospect_actions).
 */
export enum ProspectActionType {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  NOTE = 'note',
  INVITATION_SENT = 'invitation_sent',
  INVITATION_ACCEPTED = 'invitation_accepted',
  MESSAGE_SENT = 'message_sent',
  RELANCE_1 = 'relance_1',
  RELANCE_2 = 'relance_2',
  RELANCE_3 = 'relance_3',
  EMAIL_SENT = 'email_sent',
  REPLY_RECEIVED = 'reply_received',
  CALL_DISCOVERY = 'call_discovery',
  CALL_SALES = 'call_sales',
  PROPOSAL_SENT = 'proposal_sent',
  PROPOSAL_ACCEPTED = 'proposal_accepted',
  PROPOSAL_REFUSED = 'proposal_refused',
  // Actions specifiques aux business locaux.
  PHONE_CALL = 'phone_call',
  ENRICHED = 'enriched',
  IMPORTED_FROM_OSM = 'imported_from_osm',
}
