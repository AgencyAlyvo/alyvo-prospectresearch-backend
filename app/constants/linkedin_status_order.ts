import { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'

/**
 * Ordre metier des statuts atteints dans le tunnel LinkedIn (partage service / stats).
 */
export const linkedinStatusOrder: Partial<Record<LinkedinProspectStatus, number>> = {
  [LinkedinProspectStatus.A_INVITER]: 0,
  [LinkedinProspectStatus.INVITATION_ENVOYEE]: 1,
  [LinkedinProspectStatus.INVITATION_ACCEPTEE]: 2,
  [LinkedinProspectStatus.MESSAGE_1_ENVOYE]: 3,
  [LinkedinProspectStatus.RELANCE_1_ENVOYEE]: 4,
  [LinkedinProspectStatus.RELANCE_2_ENVOYEE]: 5,
  [LinkedinProspectStatus.RELANCE_3_ENVOYEE]: 6,
  [LinkedinProspectStatus.NON_REPONDU_LINKEDIN]: 6,
  [LinkedinProspectStatus.REPONDU_A_QUALIFIER]: 7,
  [LinkedinProspectStatus.REPONDU_NON_INTERESSE]: 7,
  [LinkedinProspectStatus.REPONDU_INTERESSE]: 8,
  [LinkedinProspectStatus.APPEL_DECOUVERTE_FAIT]: 9,
  [LinkedinProspectStatus.APPEL_DE_VENTE_FAIT]: 10,
  [LinkedinProspectStatus.PROPOSITION_ENVOYEE]: 11,
  [LinkedinProspectStatus.PROPOSITION_REFUSEE]: 11,
  [LinkedinProspectStatus.PROPOSITION_ACCEPTEE]: 12,
  [LinkedinProspectStatus.ARCHIVE]: 0,
}

/**
 * Indique si un statut a atteint un jalon du tunnel.
 * @param {LinkedinProspectStatus} status - Statut a evaluer.
 * @param {LinkedinProspectStatus} milestone - Jalon attendu.
 * @returns {boolean} True si le jalon est atteint ou depasse.
 */
export const hasReachedLinkedinStatus: (
  status: LinkedinProspectStatus,
  milestone: LinkedinProspectStatus,
) => boolean = (status: LinkedinProspectStatus, milestone: LinkedinProspectStatus): boolean =>
  (linkedinStatusOrder[status] ?? 0) >= (linkedinStatusOrder[milestone] ?? 0)
