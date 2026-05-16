/**
 * Reponse token retournee au frontend desktop.
 */
export type AuthTokenResponse = {
  type: 'bearer'
  value: string
  expiresAt: string | null
}
