import type UserSetting from '#models/user_setting'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { UserSettingsResponse } from '#types/response/settings/user_settings_response'

/**
 * Transformer pour les parametres utilisateur (cahier paragraphe 14).
 */
export default class UserSettingsTransformer extends BaseTransformer<UserSetting> {
  /**
   * Transforme les parametres en payload public.
   * @returns {UserSettingsResponse} Reponse serialisable.
   */
  public toObject(): UserSettingsResponse {
    return {
      maxInvitesPerWeek: this.resource.maxInvitesPerWeek,
      relance1DelayDays: this.resource.relance1DelayDays,
      relance2DelayDays: this.resource.relance2DelayDays,
      relance3DelayDays: this.resource.relance3DelayDays,
    }
  }
}
