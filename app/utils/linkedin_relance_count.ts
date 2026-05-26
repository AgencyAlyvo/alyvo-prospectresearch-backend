import type LinkedinProspect from '#models/linkedin_prospect'

/**
 * Recalcule le nombre de relances effectuees sur un prospect.
 * @param {LinkedinProspect} prospect - Prospect a evaluer.
 * @returns {number} Nombre de relances effectuees.
 */
export const getLinkedinRelancesCount: (prospect: LinkedinProspect) => number = (
  prospect: LinkedinProspect,
): number => {
  if (prospect.relance3At) {
    return 3
  }
  if (prospect.relance2At) {
    return 2
  }
  if (prospect.relance1At) {
    return 1
  }

  return 0
}
