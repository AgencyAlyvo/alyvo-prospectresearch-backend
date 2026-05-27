/**
 * Statuts du tunnel de prospection des business locaux.
 * Stockes en base sous forme de chaine snake_case (cohérent avec LinkedinProspectStatus).
 */
export enum LocalBusinessStatus {
  A_CONTACTER = 'a_contacter',
  EMAIL_ENVOYE = 'email_envoye',
  APPEL_PASSE = 'appel_passe',
  RELANCE_1_ENVOYEE = 'relance_1_envoyee',
  RELANCE_2_ENVOYEE = 'relance_2_envoyee',
  RELANCE_3_ENVOYEE = 'relance_3_envoyee',
  NON_REPONDU = 'non_repondu',
  REPONDU_INTERESSE = 'repondu_interesse',
  REPONDU_NON_INTERESSE = 'repondu_non_interesse',
  APPEL_DECOUVERTE_FAIT = 'appel_decouverte_fait',
  APPEL_DE_VENTE_FAIT = 'appel_de_vente_fait',
  PROPOSITION_ENVOYEE = 'proposition_envoyee',
  PROPOSITION_ACCEPTEE = 'proposition_acceptee',
  PROPOSITION_REFUSEE = 'proposition_refusee',
  ARCHIVE = 'archive',
}
