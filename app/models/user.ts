import { UserSchema } from '#database/schema'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import env from '#start/env'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * The access token provider for the user model.
   * This provider is used to generate and validate access tokens for the user.
   */
  public static accessTokens: DbAccessTokensProvider<typeof User> = DbAccessTokensProvider.forModel(User, {
    expiresIn: env.get('API_USER_TOKEN_EXPIRATION'),
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: env.get('API_USER_TOKEN_SECRET_LENGTH'),
  })

  /**
   * The currently authenticated access token for the user.
   * This property is set when the user is authenticated using an access token.
   */
  declare public currentAccessToken?: AccessToken
}
