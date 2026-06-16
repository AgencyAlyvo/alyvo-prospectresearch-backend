import UserSettingsService from '#services/user_settings_service'
import UserSettingsTransformer from '#transformers/user_settings_transformer'
import { updateUserSettingsValidator } from '#validators/settings/user_settings_validator'
import type { UpdateUserSettingsPayload } from '#types/payload/settings/update_user_settings_payload'
import type UserSetting from '#models/user_setting'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controleur des parametres utilisateur (cahier paragraphe 14).
 */
export default class UserSettingsController {
  /**
   * @summary Parametres utilisateur
   * @description Renvoie les parametres LinkedIn de l'utilisateur.
   * @responseBody 200 - Parametres
   */
  /**
   * Renvoie les parametres.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async getUserSettings({ auth, serialize }: HttpContext): Promise<unknown> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(auth.user!)
    return serialize(UserSettingsTransformer.transform(settings))
  }

  /**
   * @summary Met a jour les parametres utilisateur
   * @description Met a jour les limites et delais LinkedIn.
   * @requestBody <UpdateUserSettingsPayload>
   * @responseBody 200 - Parametres mis a jour
   */
  /**
   * Met a jour les parametres.
   * @param {HttpContext} ctx - Contexte HTTP Adonis.
   * @returns {Promise<unknown>} Reponse JSON serialisee.
   */
  public async updateUserSettings({ request, auth, serialize }: HttpContext): Promise<unknown> {
    const payload: UpdateUserSettingsPayload = (await request.validateUsing(
      updateUserSettingsValidator,
    )) as UpdateUserSettingsPayload
    const settings: UserSetting = await UserSettingsService.updateUserSettings(payload, auth.user!)
    return serialize(UserSettingsTransformer.transform(settings))
  }
}
