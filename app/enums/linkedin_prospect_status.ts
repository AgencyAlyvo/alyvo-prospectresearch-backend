/**
 * Statuts du cycle LinkedIn (cahier des charges paragraphe 6.3).
 * Stockes en base sous forme de chaine snake_case pour rester compatibles avec
 * l'enum Postgres et lisibles dans les requetes manuelles.
 */
export enum LinkedinProspectStatus {
  A_INVITER = 'a_inviter',
  INVITATION_ENVOYEE = 'invitation_envoyee',
  INVITATION_ACCEPTEE = 'invitation_acceptee',
  MESSAGE_1_ENVOYE = 'message_1_envoye',
  RELANCE_1_ENVOYEE = 'relance_1_envoyee',
  RELANCE_2_ENVOYEE = 'relance_2_envoyee',
  RELANCE_3_ENVOYEE = 'relance_3_envoyee',
  NON_REPONDU_LINKEDIN = 'non_repondu_linkedin',
  REPONDU_A_QUALIFIER = 'repondu_a_qualifier',
  REPONDU_INTERESSE = 'repondu_interesse',
  REPONDU_NON_INTERESSE = 'repondu_non_interesse',
  APPEL_DECOUVERTE_FAIT = 'appel_decouverte_fait',
  APPEL_DE_VENTE_FAIT = 'appel_de_vente_fait',
  PROPOSITION_ENVOYEE = 'proposition_envoyee',
  PROPOSITION_ACCEPTEE = 'proposition_acceptee',
  PROPOSITION_REFUSEE = 'proposition_refusee',
  ARCHIVE = 'archive',
}
