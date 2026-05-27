/**
 * Normalise une URL HTTP(S) issue d'OSM ou d'un import ; renvoie null si non exploitable.
 * @param {string | null | undefined} value - Valeur brute.
 * @returns {string | null} URL absolue ou null.
 */
export function normalizeExternalUrl(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }
  const trimmed: string = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  let candidate: string = trimmed
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`
  }

  try {
    const url: URL = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

/**
 * Conserve un email OSM uniquement s'il a un format plausible.
 * @param {string | null | undefined} value - Email brut.
 * @returns {string | null} Email normalise ou null.
 */
export function normalizeImportEmail(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }
  const trimmed: string = value.trim().toLowerCase()
  if (trimmed.length === 0) {
    return null
  }
  const plausible: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  return plausible ? trimmed : null
}
