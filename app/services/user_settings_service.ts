import UserSetting from '#models/user_setting'
import type User from '#models/user'
import type { UpdateUserSettingsPayload } from '#types/payload/settings/update_user_settings_payload'

/**
 * Service metier pour les parametres utilisateur (cahier paragraphe 14).
 */
export default class UserSettingsService {
  /**
   * Recupere les parametres de l'utilisateur, en initialisant une ligne avec
   * les valeurs par defaut s'il n'en existe pas encore.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<UserSetting>} Parametres charges (jamais null).
   */
  public static async getUserSettings(user: User): Promise<UserSetting> {
    const existing: UserSetting | null = await UserSetting.findBy('user_id', user.id)
    if (existing) {
      return existing
    }
    return await UserSetting.create({
      userId: user.id,
      maxInvitesPerWeek: 100,
      relance1DelayDays: 3,
      relance2DelayDays: 7,
      relance3DelayDays: 15,
    })
  }

  /**
   * Met a jour les parametres utilisateur.
   * @param {UpdateUserSettingsPayload} payload - Champs a mettre a jour.
   * @param {User} user - Utilisateur authentifie.
   * @returns {Promise<UserSetting>} Parametres mis a jour.
   */
  public static async updateUserSettings(payload: UpdateUserSettingsPayload, user: User): Promise<UserSetting> {
    const settings: UserSetting = await UserSettingsService.getUserSettings(user)
    settings.merge(payload)
    await settings.save()
    return settings
  }
}
