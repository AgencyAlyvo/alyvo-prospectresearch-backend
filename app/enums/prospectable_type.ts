/**
 * Type de prospect cible par une action.
 * Sert de discriminant pour la table prospect_actions.
 */
export enum ProspectableType {
  LINKEDIN_PROSPECT = 'linkedin_prospect',
  LOCAL_BUSINESS_PROSPECT = 'local_business_prospect',
}
