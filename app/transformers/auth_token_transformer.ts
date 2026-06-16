import type { AuthTokenResponse } from '#types/response/auth_token_response'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

/**
 * Transformer dedie aux access tokens Adonis.
 */
export default class AuthTokenTransformer extends BaseTransformer<AccessToken> {
  /**
   * Transforme un AccessToken Adonis en contrat stable pour le frontend.
   * @returns {AuthTokenResponse} Reponse auth serialisee.
   */
  public toObject(): AuthTokenResponse {
    return {
      type: 'bearer',
      value: this.resource.value?.release() || '',
      expiresAt: this.resource.expiresAt ? this.resource.expiresAt.toISOString() : null,
    }
  }
}
