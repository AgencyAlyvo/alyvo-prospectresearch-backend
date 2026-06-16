import AuthService from '#services/auth_service'
import AuthTokenTransformer from '#transformers/auth_token_transformer'
import type { SignInPayload } from '#types/payload/sign_in_payload'
import type { SignUpPayload } from '#types/payload/sign_up_payload'
import type { AuthTokenResponse } from '#types/response/auth_token_response'
import { signInValidator, signUpValidator } from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

/**
 * Controleur d'authentification API.
 */
export default class AuthController {
  /**
   * @auth
   * @summary Inscrit un utilisateur
   * @description Cree le compte et retourne un access token opaque Adonis.
   * @requestBody <SignUpPayload>
   * @responseBody 200 - <AuthTokenResponse> - Inscription reussie
   * @responseBody 409 - <ErrorResponseBody> - Email deja utilise
   * @responseBody 422 - <ValidationErrorResponseBody> - Erreur de validation
   */
  /**
   * Inscrit l'utilisateur.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<AuthTokenResponse>} Token d'acces opaque.
   */
  public async signUp({ request, auth, serialize }: HttpContext): Promise<AuthTokenResponse> {
    // Valide l'email, le mot de passe et sa confirmation avant de creer le compte.
    const payload: SignUpPayload = await request.validateUsing(signUpValidator)

    // Cree l'utilisateur puis emet un access token opaque Adonis cote service.
    const token: AccessToken = await AuthService.signUp(payload, auth)

    // Transforme le token en JSON public puis garde le contrat frontend a la racine.
    return serialize.withoutWrapping(AuthTokenTransformer.transform(token))
  }

  /**
   * @auth
   * @summary Connecte un utilisateur
   * @description Verifie les identifiants et retourne un access token opaque Adonis.
   * @requestBody <SignInPayload>
   * @responseBody 200 - <AuthTokenResponse> - Connexion reussie
   * @responseBody 401 - <ErrorResponseBody> - Identifiants invalides
   * @responseBody 422 - <ValidationErrorResponseBody> - Erreur de validation
   */
  /**
   * Connecte l'utilisateur.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<AuthTokenResponse>} Token d'acces opaque.
   */
  public async signIn({ request, auth, serialize }: HttpContext): Promise<AuthTokenResponse> {
    // Valide le body entrant et retourne un payload typé, utilisable en confiance ensuite.
    const payload: SignInPayload = await request.validateUsing(signInValidator)

    // Vérifie les identifiants et crée un access token opaque Adonis côté service.
    const token: AccessToken = await AuthService.signIn(payload, auth)

    // Transforme le token en JSON public puis garde le contrat frontend à la racine.
    return serialize.withoutWrapping(AuthTokenTransformer.transform(token))
  }

  /**
   * @auth
   * @summary Deconnecte l'utilisateur courant
   * @description Revoque le token d'acces courant.
   * @responseBody 204 - Token revoque
   * @responseBody 401 - <ErrorResponseBody> - Token manquant ou invalide
   */
  /**
   * Deconnecte l'utilisateur courant.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<void>}
   */
  public async logout({ auth, response }: HttpContext): Promise<void> {
    // Révoque le token bearer utilisé pour cette requête authentifiée.
    await AuthService.logout(auth)

    // Répond sans contenu: la déconnexion est terminée, rien d'autre à renvoyer.
    response.noContent()
  }
}
