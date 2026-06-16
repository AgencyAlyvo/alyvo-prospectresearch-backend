import type { SignInPayload } from '#types/payload/sign_in_payload'
import type { SignUpPayload } from '#types/payload/sign_up_payload'
import EmailAlreadyUsedException from '#exceptions/email_already_used_exception'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

/**
 * Service metier pour l'authentification API.
 */
export default class AuthService {
  /**
   * Cree un utilisateur et emet un access token opaque Adonis.
   * @param {SignUpPayload} payload - Informations d'inscription valides.
   * @param {HttpContext['auth']} auth - Service auth du contexte HTTP.
   * @returns {Promise<AccessToken>} Token opaque Adonis.
   */
  public static async signUp(payload: SignUpPayload, auth: HttpContext['auth']): Promise<AccessToken> {
    const existingUser: User | null = await User.findBy('email', payload.email)

    if (existingUser) {
      throw new EmailAlreadyUsedException()
    }

    // Cree le compte; le hook withAuthFinder hash le mot de passe avant l'insertion.
    const user: User = await User.create({
      email: payload.email,
      password: payload.password,
    })

    // Connecte directement le nouvel utilisateur avec le meme token opaque que le signin.
    return auth.use('api').createToken(user, ['*'], {
      name: 'Alyvo ProspectResearch desktop',
    })
  }

  /**
   * Verifie les identifiants et emet un access token opaque Adonis.
   * @param {SignInPayload} payload - Identifiants valides.
   * @param {HttpContext['auth']} auth - Service auth du contexte HTTP.
   * @returns {Promise<AccessToken>} Token opaque Adonis.
   */
  public static async signIn(payload: SignInPayload, auth: HttpContext['auth']): Promise<AccessToken> {
    // Compare l'email et le mot de passe avec les credentials hashés en base.
    const user: User = await User.verifyCredentials(payload.email, payload.password)

    // Émet un token opaque stocké hashé en base, utilisable dans Authorization: Bearer.
    return auth.use('api').createToken(user, ['*'], {
      name: 'Alyvo ProspectResearch desktop',
    })
  }

  /**
   * Invalide le token courant.
   * @param {HttpContext['auth']} auth - Service auth du contexte HTTP.
   * @returns {Promise<void>}
   */
  public static async logout(auth: HttpContext['auth']): Promise<void> {
    // Supprime le token courant de la table auth_access_tokens pour le révoquer immédiatement.
    await auth.use('api').invalidateToken()
  }
}
