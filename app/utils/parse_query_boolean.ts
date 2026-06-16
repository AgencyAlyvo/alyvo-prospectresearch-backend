/**
 * Interprete un parametre de query string ou body comme booleen.
 * @param {unknown} value - Valeur brute (souvent string depuis l'URL).
 * @returns {boolean | undefined} Booleen ou undefined si absent / invalide.
 */
export const parseQueryBoolean: (value: unknown) => boolean | undefined = (value: unknown): boolean | undefined => {
  if (value === true || value === 'true' || value === '1' || value === 1) {
    return true
  }

  if (value === false || value === 'false' || value === '0' || value === 0) {
    return false
  }

  return undefined
}
